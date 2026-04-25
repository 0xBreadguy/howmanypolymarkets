# Findings

## Restructure Goals
- Current site is a single `index.html` file.
- Bread wants a project structure that supports ongoing editing and gathering brand assets.
- Best structure should separate:
  - source files
  - chain data
  - brand/visual assets
  - docs/instructions

## Proposed Layout
- `src/` for HTML/CSS/JS source
- `data/` for chain throughput data
- `assets/` for logos, screenshots, icons, brand files
- `docs/` for content/brand notes and contribution instructions
- root `index.html` can stay as deploy entry, or reference `src/` assets directly
