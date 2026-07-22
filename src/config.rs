use std::net::SocketAddr;
use std::path::PathBuf;

use anyhow::Context;

const DEFAULT_DATA_URL: &str = "https://static.bookwalker.com/data/bkwk-db.sqlite.zst";
const DEFAULT_DATA_DIR: &str = "./data";
const DEFAULT_BIND_ADDR: &str = "0.0.0.0:8362";

pub struct Config {
    pub data_url: String,
    pub data_dir: PathBuf,
    pub bind_addr: SocketAddr,
    pub refresh_secret: String,
    pub user_agent: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let data_url = std::env::var("DATA_URL").unwrap_or_else(|_| DEFAULT_DATA_URL.to_string());
        let data_dir = std::env::var("DATA_DIR").unwrap_or_else(|_| DEFAULT_DATA_DIR.to_string());
        let bind_addr =
            std::env::var("BIND_ADDR").unwrap_or_else(|_| DEFAULT_BIND_ADDR.to_string());
        let bind_addr: SocketAddr = bind_addr
            .parse()
            .with_context(|| format!("invalid BIND_ADDR: {bind_addr}"))?;
        let refresh_secret = std::env::var("REFRESH_SECRET").context(
            "REFRESH_SECRET env var must be set (used to authorize POST /internal/refresh)",
        )?;

        Ok(Self {
            data_url,
            data_dir: PathBuf::from(data_dir),
            bind_addr,
            refresh_secret,
            user_agent: format!(
                "bwg-data-stuff/{} (+https://github.com/noaione/bwg-data-stuff)",
                env!("CARGO_PKG_VERSION")
            ),
        })
    }
}
