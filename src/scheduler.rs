use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use crate::{refresh, state::AppState};

const SECONDS_PER_DAY: u64 = 86_400;

/// UTC midnight is an exact multiple of 86,400 seconds since the Unix epoch
/// (no DST/timezone math involved), so no datetime crate is needed here.
fn duration_until_next_midnight_utc() -> Duration {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system clock is before the unix epoch")
        .as_secs();
    let next_midnight = (now / SECONDS_PER_DAY + 1) * SECONDS_PER_DAY;
    Duration::from_secs(next_midnight - now)
}

pub fn spawn(state: Arc<AppState>) {
    tokio::spawn(async move {
        loop {
            let sleep_for = duration_until_next_midnight_utc();
            tracing::info!(seconds = sleep_for.as_secs(), "next refresh scheduled");
            tokio::time::sleep(sleep_for).await;

            tracing::info!("scheduled refresh starting");
            let outcome = refresh::run(&state).await;
            tracing::info!(?outcome, "scheduled refresh finished");
        }
    });
}
