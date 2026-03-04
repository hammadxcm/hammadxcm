# Portfolio Stats API

Cloudflare Worker + KV for anonymous aggregate counters (social proof). No PII stored.

## Endpoints

| Method | Path         | Description           |
| ------ | ------------ | --------------------- |
| POST   | `/api/track` | Increment a counter   |
| GET    | `/api/stats` | Return all counters   |

### POST /api/track

```json
{ "event": "visit" }
```

Valid events: `visit`, `ctf_solved`, `konami`, `achievement_unlocked`, `guestbook_reached`, `code_copy`, `social_click`, `resume_export`, `command_palette`, `annotations`. Also accepts `theme:*`, `level:*`, and `ach:*` prefixed events.

Rate limited: 1 write per 10s per IP. Returns `429` if exceeded.

### GET /api/stats

Returns all counters as JSON:
```json
{ "visit": 1234, "theme:hacker": 500, "ctf_solved": 42 }
```

Cached for 60s via `Cache-Control`.

## Setup

1. Create a KV namespace:
   ```sh
   wrangler kv:namespace create STATS
   ```
2. Update `wrangler.toml` with the namespace ID
3. Set `ALLOWED_ORIGIN` in `wrangler.toml`

## Local Development

```sh
cd workers/stats-api
wrangler dev
```

## Deploy

```sh
wrangler deploy
```
