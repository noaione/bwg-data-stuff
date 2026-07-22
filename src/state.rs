use std::path::PathBuf;

use arc_swap::ArcSwapOption;
use sqlx::SqlitePool;
use tokio::sync::Mutex;

use crate::config::Config;

pub struct Loaded {
    pub pool: SqlitePool,
    pub generated_at: String,
    pub path: PathBuf,
}

pub struct AppState {
    pub serving: ArcSwapOption<Loaded>,
    pub refresh_lock: Mutex<()>,
    pub config: Config,
    pub http_client: reqwest::Client,
}

impl AppState {
    pub fn new(config: Config) -> anyhow::Result<Self> {
        let http_client = reqwest::Client::builder()
            .user_agent(config.user_agent.clone())
            .build()?;

        Ok(Self {
            serving: ArcSwapOption::empty(),
            refresh_lock: Mutex::new(()),
            config,
            http_client,
        })
    }
}
