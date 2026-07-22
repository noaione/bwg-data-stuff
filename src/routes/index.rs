use axum::response::Html;

const PAGE: &str = r#"<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>bwg-data-stuff</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Neuton:ital,wght@0,400;0,700;0,800;1,400&display=swap" rel="stylesheet">
<style>
    body { font-family: "Neuton", serif; line-height: 1.6; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; color: #1a1a1a; }
    h1 { font-weight: 800; }
    code { background: #f0f0f0; padding: 0.15rem 0.35rem; border-radius: 4px; }
    table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.85rem 0.75rem; border-bottom: 1px solid #ddd; vertical-align: top; }
    th { color: #666; font-weight: 700; }
    tr:last-child td { border-bottom: none; }
    .method { font-weight: 800; letter-spacing: 0.04em; }
    a { color: #0645ad; }
    footer { margin-top: 0rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: 0.9rem; color: #555; }
    footer p { margin: 0.35rem 0; }
</style>
</head>
<body>
    <h1>bwg-data-stuff</h1>
    <p>API endpoints that process and adapt <a href="https://data.bookwalker.com/">BookWalker Data</a> for easier access.</p>
    <table>
        <tr><th>Method</th><th>Route</th><th>Description</th></tr>
        <tr><td><span class="method">GET</span></td><td><code>/api/geoblocks/:contentId</code></td><td>Geo-blocking info for a content ID (accepts with or without the <code>CNT_</code> prefix). Supports <code>?normalize=true</code>.</td></tr>
        <tr><td><span class="method">GET</span></td><td><code>/api/info</code></td><td>Dataset metadata (schema version, generation time, row counts).</td></tr>
        <tr><td><span class="method">POST</span></td><td><code>/internal/refresh</code></td><td>Manually trigger a dataset refresh. Requires the <code>X-Refresh-Secret</code> header.</td></tr>
    </table>
    <footer>
        <p>Data provided by M12 Media LLC, licensed under the <a href="https://static.bookwalker.com/legal/data-tos.html">BookWalker Data Export License</a> (based on <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>). The data served above has been adapted from the original dump.</p>
        <p>Source code on <a href="https://github.com/noaione/bwg-data-stuff">GitHub</a>, licensed under the <a href="https://github.com/noaione/bwg-data-stuff/blob/main/LICENSE">MIT License</a>.</p>
    </footer>
</body>
</html>"#;

pub async fn index() -> Html<&'static str> {
    Html(PAGE)
}
