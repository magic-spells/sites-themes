# sites-themes: rules for coding agents

The base themes for Magic Spells Sites, one folder per theme. The repo is public and MIT.

- **The contract is the theme structure document** in the Sites engine docs
  (`engine/docs/theme-structure.md`, and `theme-repo.md` for the repo shape). A theme here must
  compile under it; Sites' own tests check that after it fetches a release.
- **Each theme has its own version; the repo has none.** A release is a tag
  `<name>/v<version>` (the folder name, a slash, a semver: `company/v0.2.0`), and its workflow
  zips that one folder. Several tags may sit on one commit, pushed at most three at a time
  (GitHub fires no workflow when a push carries more than three tags). Git cannot hold a plain
  tag `<name>` beside `<name>/v…`, so a bare theme name is never a tag. Cory tags; agents never
  create tags and never publish. A published zip never changes: a mistake is fixed with a new version.
- **Branches.** Feature branches off `main`, merged back to `main`. There are no release
  branches.
- **A theme change bumps that theme** in the same change: its `settings/theme.json` `version` and
  a `## <version>` section in its `CHANGELOG.md` (the release notes come from it).
- **The Sites registry owns releases.** The store installs what is published there, through the
  Publisher page or `scripts/publish-history.sh`; listing copy lives on the package page in Sites.
  The tag is provenance: its zip and `.sha256`, which `scripts/zip.sh` rebuilds byte for byte.
  `sh scripts/check-registry.sh` checks each folder's version is published (skipped without
  `SITES_TOKEN`, a read-only key for `GET /v1/themes/catalog`, never the publish key), so after merging a bump, tag and publish it.
- **Tailwind first.** Every token reaches markup as a utility through `styles/theme.css`'s
  `@theme`. No arbitrary values (`p-[13px]`, `bg-[#070c16]`): add the token to `settings/design.json`
  first. No `<style>` in a `.pzl` file. Hand-written CSS only for what utilities cannot express.
  Sizes, radius and spacing are rems, never px (borders and shadows may be px).
- **No coloured left-edge accent bars** on cards, rows or callouts. Show status with a dot, a
  badge or text.
- **Vocabulary:** say workspace and handle, the words Sites uses.
- Never name the hosted e-commerce platform the theme format comes from, its template-language
  terms or any client, anywhere in this repo.
