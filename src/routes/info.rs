use std::collections::BTreeMap;
use std::sync::Arc;

use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Json, Response};
use serde_json::Value;
use sqlx::Row;

use crate::state::AppState;

pub async fn get_info(State(state): State<Arc<AppState>>) -> Response {
    let Some(loaded) = state.serving.load_full() else {
        return StatusCode::SERVICE_UNAVAILABLE.into_response();
    };

    let rows = match sqlx::query("SELECT key, value FROM export_metadata")
        .fetch_all(&loaded.pool)
        .await
    {
        Ok(rows) => rows,
        Err(err) => {
            tracing::error!(error = %err, "failed to query export_metadata");
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    // Metadata values are stored as raw strings but are often themselves JSON
    // (e.g. row_counts); parse each one so the response nests real objects
    // instead of double-encoded strings, falling back to the raw string for
    // anything that isn't valid JSON (e.g. generated_at's timestamp).
    let mut metadata: BTreeMap<String, Value> = BTreeMap::new();
    for row in rows {
        let key: String = row.get("key");
        let value: String = row.get("value");
        let parsed = serde_json::from_str(&value).unwrap_or(Value::String(value));
        metadata.insert(key, parsed);
    }

    Json(metadata).into_response()
}
