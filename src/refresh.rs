use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use futures_util::StreamExt;
use sqlx::SqlitePool;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use tokio::io::AsyncWriteExt;

use crate::state::{AppState, Loaded};

#[derive(Debug)]
pub enum RefreshOutcome {
    Updated { generated_at: String },
    Unchanged,
    Busy,
    Error(String),
}

/// Scans `data_dir` for the newest already-extracted `bkwk-db*.sqlite` file
/// (the fixed `bkwk-db.sqlite` name covers a pre-seeded sample; timestamped
/// `bkwk-db-{unix_ts}.sqlite` names are produced by every subsequent refresh).
/// The `.bak` copy kept after a swap is intentionally excluded.
pub fn find_latest_local_db(data_dir: &Path) -> Option<PathBuf> {
    let entries = std::fs::read_dir(data_dir).ok()?;
    entries
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            let name = entry.file_name();
            let name = name.to_string_lossy();
            name.starts_with("bkwk-db")
                && name.ends_with(".sqlite")
                && !name.ends_with(".bak.sqlite")
        })
        .filter_map(|entry| {
            let modified = entry.metadata().ok()?.modified().ok()?;
            Some((entry.path(), modified))
        })
        .max_by_key(|(_, modified)| *modified)
        .map(|(path, _)| path)
}

pub async fn load_pool(path: &Path) -> anyhow::Result<(SqlitePool, String)> {
    let opts = SqliteConnectOptions::new()
        .filename(path)
        .read_only(true)
        .immutable(true);
    let pool = SqlitePoolOptions::new()
        .max_connections(8)
        .connect_with(opts)
        .await?;
    let generated_at: String =
        sqlx::query_scalar("SELECT value FROM export_metadata WHERE key = 'generated_at'")
            .fetch_one(&pool)
            .await?;
    Ok((pool, generated_at))
}

/// Downloads, decompresses, sanity-checks and swaps in a fresh copy of the
/// dataset. The previously-installed pool (if any) keeps serving requests for
/// the entire duration of this function; only the final pointer swap is
/// atomic, so callers never observe a half-updated dataset.
pub async fn run(state: &Arc<AppState>) -> RefreshOutcome {
    let _guard = match state.refresh_lock.try_lock() {
        Ok(guard) => guard,
        Err(_) => return RefreshOutcome::Busy,
    };

    match run_inner(state).await {
        Ok(outcome) => outcome,
        Err(err) => {
            tracing::error!(error = %err, "refresh failed");
            RefreshOutcome::Error(err.to_string())
        }
    }
}

async fn run_inner(state: &Arc<AppState>) -> anyhow::Result<RefreshOutcome> {
    let data_dir = &state.config.data_dir;
    std::fs::create_dir_all(data_dir)?;

    let tmp = tempfile::Builder::new()
        .prefix(".bkwk-download-")
        .suffix(".zst.tmp")
        .tempfile_in(data_dir)?;
    let tmp_path = tmp.path().to_path_buf();

    {
        let response = state
            .http_client
            .get(&state.config.data_url)
            .send()
            .await?
            .error_for_status()?;
        let std_file = tmp.reopen()?;
        let mut out = tokio::fs::File::from_std(std_file);
        let mut stream = response.bytes_stream();
        while let Some(chunk) = stream.next().await {
            out.write_all(&chunk?).await?;
        }
        out.flush().await?;
    }

    let unix_ts = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
    let new_db_path = data_dir.join(format!("bkwk-db-{unix_ts}.sqlite"));
    let blocking_tmp_path = tmp_path.clone();
    let blocking_new_path = new_db_path.clone();
    tokio::task::spawn_blocking(move || -> anyhow::Result<()> {
        let src = std::fs::File::open(&blocking_tmp_path)?;
        let mut reader = std::io::BufReader::new(src);
        let dst = std::fs::File::create(&blocking_new_path)?;
        let mut writer = std::io::BufWriter::new(dst);
        zstd::stream::copy_decode(&mut reader, &mut writer)?;
        Ok(())
    })
    .await??;

    // The temp .zst download is no longer needed; dropping it deletes the file.
    drop(tmp);

    let (new_pool, new_generated_at) = match load_pool(&new_db_path).await {
        Ok(loaded) => loaded,
        Err(err) => {
            let _ = std::fs::remove_file(&new_db_path);
            return Err(err);
        }
    };

    let previous = state.serving.load_full();
    if let Some(previous) = &previous
        && new_generated_at <= previous.generated_at
    {
        new_pool.close().await;
        let _ = std::fs::remove_file(&new_db_path);
        return Ok(RefreshOutcome::Unchanged);
    }

    let new_loaded = Arc::new(Loaded {
        pool: new_pool,
        generated_at: new_generated_at.clone(),
        path: new_db_path,
    });
    let old = state.serving.swap(Some(new_loaded));

    if let Some(old) = old {
        // Waits for any in-flight requests still using the old pool to finish
        // before actually closing it.
        old.pool.close().await;
        let bak_path = data_dir.join("bkwk-db.bak.sqlite");
        let _ = std::fs::remove_file(&bak_path);
        if let Err(err) = std::fs::rename(&old.path, &bak_path) {
            tracing::warn!(error = %err, "failed to retain previous db as backup");
        }
    }

    Ok(RefreshOutcome::Updated {
        generated_at: new_generated_at,
    })
}
