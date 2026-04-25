# howmanypolymarkets

A simple microsite that compares blockchain throughput against a Polymarket-scale app (~11M gas/sec).

## Live site
- https://howmanypolymarkets.bread.build/

## How it works
- Each chain has a throughput value in `data/chains.json`
- The site converts that throughput into rough Polymarket-equivalent capacity
- The hero visualization uses falling Polymarket logo tokens to make the scale feel visceral

## Repo structure
- `index.html` — entrypoint
- `src/css/styles.css` — styling
- `src/js/app.js` — UI + physics/rendering logic
- `data/chains.json` — editable chain dataset
- `assets/chains/` — chain logos
- `assets/brand/` — shared brand assets (e.g. Polymarket logo)
- `docs/` — contributor docs

## Add a new chain
1. Add a logo file to `assets/chains/`
2. Add a new object to `data/chains.json`
3. Keep values normalized:
   - `execBlockTime` in milliseconds as a string number (example: `"250"`)
   - `gasPerSec` in millions of gas/sec as a number (example: `122`)
4. Push to `main` (Cloudflare Pages deploys automatically)

See `docs/CONTRIBUTING.md` for the full format.
