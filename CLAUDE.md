# sites-themes: rules for coding agents

The base themes for Magic Spells Sites, one folder per theme. The repo is public and MIT.

- **The contract is the theme structure document** in the Sites engine docs
  (`engine/docs/theme-structure.md`, and `theme-repo.md` for the repo shape). A theme here must
  compile under it; Sites' own tests check that after it fetches a release.
- **Releases.** Work on the current `release/x.y.z` branch; small changes go straight onto it,
  real work gets `feat/<name>` off it and merges back. Never commit to `main`. Never create
  tags and never publish: Cory tags, and the tag's workflow builds the release zip. A published
  zip never changes.
- **One version for the repo** (the tag). Each theme's `theme.json` `version` and
  `CHANGELOG.md` move when that theme changes.
- **Tailwind first.** Every token reaches markup as a utility through `styles/theme.css`'s
  `@theme`. No arbitrary values (`p-[13px]`, `bg-[#070c16]`): add the token to `design.json`
  first. No `<style>` in a `.pzl` file. Hand-written CSS only for what utilities cannot express.
  Sizes, radius and spacing are rems, never px (borders and shadows may be px).
- **No coloured left-edge accent bars** on cards, rows or callouts. Show status with a dot, a
  badge or text.
- **Vocabulary:** say workspace and handle, the words Sites uses.
- Never name the hosted e-commerce platform the theme format comes from, its template-language
  terms or any client, anywhere in this repo.
