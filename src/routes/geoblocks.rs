use std::sync::Arc;

use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Json, Response};
use serde::{Deserialize, Serialize};
use sqlx::Row;

use crate::state::AppState;

#[derive(Deserialize)]
pub struct GeoblockQuery {
    #[serde(default)]
    normalize: bool,
}

#[derive(Serialize)]
struct GeoBlocks {
    global: bool,
    allowed: Vec<String>,
    blocked: Vec<String>,
}

#[derive(Serialize)]
struct GeoblockResponse {
    id: String,
    #[serde(rename = "productId")]
    product_id: String,
    title: String,
    #[serde(rename = "geoBlocks")]
    geo_blocks: GeoBlocks,
}

fn display_name(alpha2: &str) -> String {
    rust_iso3166::from_alpha2(alpha2)
        .map(|c| c.name.to_string())
        .unwrap_or_else(|| alpha2.to_string())
}

pub async fn get_geoblock(
    State(state): State<Arc<AppState>>,
    Path(content_id): Path<String>,
    Query(query): Query<GeoblockQuery>,
) -> Response {
    // `serving` is only None before the very first successful load; the
    // availability middleware already handles that case for /api/*, but this
    // guard keeps the handler correct if it's ever mounted elsewhere.
    let Some(loaded) = state.serving.load_full() else {
        return StatusCode::SERVICE_UNAVAILABLE.into_response();
    };

    let content_id = if content_id.starts_with("CNT_") {
        content_id
    } else {
        format!("CNT_{content_id}")
    };

    let product_row = match sqlx::query(
        "SELECT id, display_title, geoblock_id FROM products WHERE content_id = ?",
    )
    .bind(&content_id)
    .fetch_optional(&loaded.pool)
    .await
    {
        Ok(Some(row)) => row,
        Ok(None) => return StatusCode::NOT_FOUND.into_response(),
        Err(err) => {
            tracing::error!(error = %err, "failed to query products");
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };

    let product_id: String = product_row.get("id");
    let title: String = product_row.get("display_title");
    let geoblock_id: Option<String> = product_row.get("geoblock_id");

    let mut global = false;
    let mut allowed = Vec::new();
    let mut blocked = Vec::new();

    if let Some(geoblock_id) = geoblock_id {
        let territory_rows = match sqlx::query(
            "SELECT territory, type FROM geoblock_territories WHERE geoblock_id = ?",
        )
        .bind(&geoblock_id)
        .fetch_all(&loaded.pool)
        .await
        {
            Ok(rows) => rows,
            Err(err) => {
                tracing::error!(error = %err, "failed to query geoblock_territories");
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
        };

        for row in territory_rows {
            let territory: String = row.get("territory");
            // type: 0 = allow, 1 = disallow, 2 = WORLD sentinel (baseline, not a real territory)
            let territory_type: i64 = row.get("type");
            match territory_type {
                0 => allowed.push(territory),
                1 => blocked.push(territory),
                2 => global = true,
                _ => {}
            }
        }
    }

    if query.normalize {
        allowed = allowed.iter().map(|c| display_name(c)).collect();
        blocked = blocked.iter().map(|c| display_name(c)).collect();
    }

    Json(GeoblockResponse {
        id: content_id,
        product_id,
        title,
        geo_blocks: GeoBlocks {
            global,
            allowed,
            blocked,
        },
    })
    .into_response()
}
