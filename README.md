# bwg-data-stuff

A collection of API endpoints that process [BookWalker Data](https://data.bookwalker.com/) for easier access.

## Endpoints

### `/api/geoblocks/:contentId`

Return the geo-blocking information for a given content ID.
Content ID can either be TSID prefixed with `CNT_` or just the TSID.

### Example Returns

```json
{
  "id": "CNT_0HTAF7BBGFF0",
  "productId": "PRD_0MN9G2H55QAG",
  "title": "The Anemone Feels the Heat, Vol. 3",
  "geoBlocks": {
    "global": false,
    "allowed": ["JP", "US", "CA"],
    "blocked": ["CN", "KR", "RU"]
  }
}
```

Or if with `?normalize=true` query parameter:

```json
{
  "id": "CNT_0HTAF7BBGFF0",
  "productId": "PRD_0MN9G2H55QAG",
  "title": "The Anemone Feels the Heat, Vol. 3",
  "geoBlocks": {
    "global": false,
    "allowed": ["Japan", "United States", "Canada"],
    "blocked": ["China", "South Korea", "Russia"]
  }
}
```

`geoBlocks.global` is `true` when the underlying data marks the title as open worldwide by default (no explicit allow/block list applies).

### `/api/info`

Returns metadata about the currently-loaded dataset, plus the source data's and this service's own provenance/license info.

```json
{
  "dataset": {
    "generatedAt": "2026-07-21T00:00:00.100Z",
    "schemaVersion": 4,
    "rowCounts": { "products": 87729, "series": 13700, "...": "..." }
  },
  "source": {
    "name": "BookWalker Data",
    "url": "https://data.bookwalker.com/",
    "license": {
      "name": "BookWalker Data Export License",
      "url": "https://static.bookwalker.com/legal/data-tos.html",
      "basedOn": "CC BY-NC-SA 4.0",
      "basedOnUrl": "https://creativecommons.org/licenses/by-nc-sa/4.0/"
    }
  },
  "service": {
    "name": "bwg-data-stuff",
    "version": "0.1.0",
    "sourceCode": "https://github.com/noaione/bwg-data-stuff",
    "license": { "name": "MIT", "url": "https://github.com/noaione/bwg-data-stuff/blob/main/LICENSE" }
  }
}
```

### `/internal/refresh`

`POST` with an `X-Refresh-Secret: <secret>` header to trigger an out-of-band dataset refresh (in addition to the automatic daily refresh at 00:00 UTC). Responds with `{"status": "updated" | "unchanged" | "busy" | "error", ...}`.

## Configuration

Environment variables (see `.env.example` — copy it to `.env` for local development):

| Variable | Default | Description |
| --- | --- | --- |
| `DATA_URL` | BookWalker's public dump URL | Where to fetch the `.sqlite.zst` dump from |
| `DATA_DIR` | `./data` | Where downloaded/extracted database files are stored |
| `BIND_ADDR` | `0.0.0.0:8362` | Address the HTTP server binds to |
| `REFRESH_SECRET` | *(required)* | Secret required to call `/internal/refresh` |

## Running

With Docker:
```bash
docker compose up -d
```

Without docker:
```bash
# Ensure you have rust
cargo build --release
./target/release/bwg-data-stuff
```

## Userscript

`injections/` is a [Makoo](https://makoojs.github.io/Makoo/) (Vue) userscript project that injects live geo-block info directly into BookWalker's own volume/chapter pages, next to the existing SERIES/PUBLISHER/ARTIST attribute list.

Build it:
```bash
pnpm install
pnpm build
```
This produces `dist/bwg-data-stuff.user.js`. Install it in Tampermonkey/Violentmonkey, then open the userscript manager's **BWG Settings** menu command to set the Host URL to a running instance of this API (defaults to `https://bwg-data-api.serik.at`). "Enable auto geo-block check" controls whether the check runs automatically on page load or only when you click "Check geo-blocking".

For local development, `pnpm dev` starts a dev server with HMR (per Makoo's own workflow).

## License

The code is licensed under the [MIT License](LICENSE).

## Attribution

This project uses the [BookWalker Data](https://data.bookwalker.com/) SQL database dumps, which is licensed under the [BookWalker Data Export License](https://static.bookwalker.com/legal/data-tos.html) which are based on the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).
