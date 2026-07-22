use std::sync::Arc;

use axum::extract::State;
use axum::http::{HeaderMap, StatusCode};
use axum::response::{IntoResponse, Json, Response};
use serde::Serialize;

use crate::refresh::{self, RefreshOutcome};
use crate::state::AppState;

#[derive(Serialize)]
#[serde(tag = "status", rename_all = "lowercase")]
enum RefreshResponse {
    Updated {
        #[serde(rename = "generatedAt")]
        generated_at: String,
    },
    Unchanged,
    Busy,
    Error {
        message: String,
    },
}

/// Constant-time comparison to avoid leaking the secret via response timing.
fn secrets_match(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (x, y) in a.iter().zip(b.iter()) {
        diff |= x ^ y;
    }
    diff == 0
}

pub async fn trigger_refresh(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Response {
    let provided = headers
        .get("X-Refresh-Secret")
        .and_then(|value| value.to_str().ok());

    let authorized = provided
        .map(|secret| secrets_match(secret.as_bytes(), state.config.refresh_secret.as_bytes()))
        .unwrap_or(false);

    if !authorized {
        return (
            StatusCode::UNAUTHORIZED,
            Json(RefreshResponse::Error {
                message: "missing or invalid X-Refresh-Secret header".to_string(),
            }),
        )
            .into_response();
    }

    match refresh::run(&state).await {
        RefreshOutcome::Updated { generated_at } => (
            StatusCode::OK,
            Json(RefreshResponse::Updated { generated_at }),
        )
            .into_response(),
        RefreshOutcome::Unchanged => {
            (StatusCode::OK, Json(RefreshResponse::Unchanged)).into_response()
        }
        RefreshOutcome::Busy => (StatusCode::CONFLICT, Json(RefreshResponse::Busy)).into_response(),
        RefreshOutcome::Error(message) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(RefreshResponse::Error { message }),
        )
            .into_response(),
    }
}
