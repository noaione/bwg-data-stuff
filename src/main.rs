mod config;
mod middleware;
mod refresh;
mod routes;
mod scheduler;
mod state;

use std::sync::Arc;

use axum::Router;
use axum::routing::{get, post};

use config::Config;
use state::{AppState, Loaded};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Loaded before anything else reads env vars (including tracing's
    // RUST_LOG). Missing .env is fine — env vars/defaults still apply.
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    let config = Config::from_env()?;
    let bind_addr = config.bind_addr;
    let data_dir = config.data_dir.clone();
    std::fs::create_dir_all(&data_dir)?;

    let state = Arc::new(AppState::new(config)?);

    if let Some(existing) = refresh::find_latest_local_db(&data_dir) {
        tracing::info!(path = %existing.display(), "loading existing local database");
        match refresh::load_pool(&existing).await {
            Ok((pool, generated_at)) => {
                state.serving.store(Some(Arc::new(Loaded {
                    pool,
                    generated_at,
                    path: existing,
                })));
            }
            Err(err) => {
                tracing::error!(error = %err, "failed to load existing local database, will fetch fresh instead");
            }
        }
    }

    if state.serving.load().is_none() {
        tracing::info!("no usable local database found, fetching initial copy in the background");
        let bg_state = state.clone();
        tokio::spawn(async move {
            let outcome = refresh::run(&bg_state).await;
            tracing::info!(?outcome, "initial fetch finished");
        });
    }

    scheduler::spawn(state.clone());

    let api_routes = Router::new()
        .route(
            "/geoblocks/{content_id}",
            get(routes::geoblocks::get_geoblock),
        )
        .route("/info", get(routes::info::get_info))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            middleware::require_loaded,
        ));

    let app = Router::new()
        .route("/", get(routes::index::index))
        .nest("/api", api_routes)
        .route("/internal/refresh", post(routes::admin::trigger_refresh))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(bind_addr).await?;
    tracing::info!(addr = %bind_addr, "listening");
    axum::serve(listener, app).await?;

    Ok(())
}
