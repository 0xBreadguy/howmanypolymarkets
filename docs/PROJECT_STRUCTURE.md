# Project Structure

This microsite is intentionally lightweight and static.

## Folders

- `index.html` — deploy entrypoint for Cloudflare Pages
- `src/css/` — stylesheets
- `src/js/` — rendering logic and interactions
- `data/` — editable chain throughput data
- `assets/brand/` — logos, colors, type references, screenshots, brand files
- `assets/chains/` — optional per-chain logos or visuals
- `docs/` — notes, structure, content guidance

## Common edits

### Add or update a chain
Edit:
- `data/chains.json`

Fields:
- `name`
- `execBlockTime`
- `metadataBlock`
- `gasLimitPerBlock`
- `gasPerSec`
- `accent`

### Update visuals
Edit:
- `src/css/styles.css`
- `src/js/app.js`
- `index.html`

### Add brand materials
Drop files into:
- `assets/brand/`

Examples:
- logos
- screenshots
- color references
- typography references
- brand copy docs
