use std::collections::HashMap;
use std::sync::Arc;

use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Json, Response};
use serde::Serialize;
use serde_json::Value;
use sqlx::Row;

use crate::state::AppState;

#[derive(Serialize)]
struct InfoResponse {
    dataset: Dataset,
    source: Source,
    service: Service,
}

#[derive(Serialize)]
struct Dataset {
    #[serde(rename = "generatedAt")]
    generated_at: Value,
    #[serde(rename = "schemaVersion")]
    schema_version: Value,
    #[serde(rename = "rowCounts")]
    row_counts: Value,
}

#[derive(Serialize)]
struct Source {
    name: &'static str,
    url: &'static str,
    license: License,
}

#[derive(Serialize)]
struct Service {
    name: &'static str,
    version: &'static str,
    #[serde(rename = "sourceCode")]
    source_code: &'static str,
    license: License,
}

#[derive(Serialize)]
struct License {
    name: &'static str,
    url: &'static str,
    #[serde(rename = "basedOn", skip_serializing_if = "Option::is_none")]
    based_on: Option<&'static str>,
    #[serde(rename = "basedOnUrl", skip_serializing_if = "Option::is_none")]
    based_on_url: Option<&'static str>,
}

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
    let mut raw: HashMap<String, Value> = HashMap::new();
    for row in rows {
        let key: String = row.get("key");
        let value: String = row.get("value");
        let parsed = serde_json::from_str(&value).unwrap_or(Value::String(value));
        raw.insert(key, parsed);
    }

    Json(InfoResponse {
        dataset: Dataset {
            generated_at: raw.remove("generated_at").unwrap_or(Value::Null),
            schema_version: raw.remove("schema_version").unwrap_or(Value::Null),
            row_counts: raw.remove("row_counts").unwrap_or(Value::Null),
        },
        source: Source {
            name: "BookWalker Data",
            url: "https://data.bookwalker.com/",
            license: License {
                name: "BookWalker Data Export License",
                url: "https://static.bookwalker.com/legal/data-tos.html",
                based_on: Some("CC BY-NC-SA 4.0"),
                based_on_url: Some("https://creativecommons.org/licenses/by-nc-sa/4.0/"),
            },
        },
        service: Service {
            name: env!("CARGO_PKG_NAME"),
            version: env!("CARGO_PKG_VERSION"),
            source_code: "https://github.com/noaione/bwg-data-stuff",
            license: License {
                name: "MIT",
                url: "https://github.com/noaione/bwg-data-stuff/blob/main/LICENSE",
                based_on: None,
                based_on_url: None,
            },
        },
    })
    .into_response()
}
