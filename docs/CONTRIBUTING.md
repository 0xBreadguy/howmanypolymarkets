# Contributing

This project is intentionally simple so contributors can add chains or tweak visuals without framework overhead.

## Add a chain

### 1) Add the logo
Put the logo in:
- `assets/chains/`

Suggested naming:
- `chain-name-logo.jpg`
- `chain-name-logo.png`
- SVG is also fine if available

### 2) Add the chain entry
Edit `data/chains.json` and add a new object.

Example:
```json
{
  "name": "Example Chain",
  "execBlockTime": "250",
  "metadataBlock": "250ms",
  "gasLimitPerBlock": "32M",
  "gasPerSec": 14,
  "accent": "#7bd1ff",
  "logo": "./assets/chains/example-chain-logo.jpg"
}
```

## Data conventions
- `execBlockTime` → normalized milliseconds, stored as a string number for display in the `Block Time (ms)` column
- `gasPerSec` → number in millions of gas/sec
- `logo` → relative path from site root
- `accent` → optional chain accent color used in parts of the UI

## Update design / interaction
- `src/css/styles.css` → styling
- `src/js/app.js` → rendering, copy logic, and physics tuning
- `index.html` → page structure

## Deployment
Cloudflare Pages deploys automatically from the `main` branch.
