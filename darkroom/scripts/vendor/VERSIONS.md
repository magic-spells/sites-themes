# Vendored builds

Copied in, by Cory's rule for every Magic Spells component a theme uses: "we copy in the esm file". None of
them is an npm dependency of the theme; the build resolves only these relative imports.

| File | Package | Version | Source |
|---|---|---|---|
| tarot.esm.js, ../styles/vendor/tarot.css | @magic-spells/tarot | 0.1.0 (unpublished) | tarot monorepo packages/tarot/dist, built 2026-10-31 |
| lightbox.min.js, ../styles/vendor/lightbox.css | @magic-spells/tarot-plugins | 0.1.0 (unpublished) | packages/tarot-plugins/dist (the UMD build carries morph-engine 0.4.2) |
| lazy-load.esm.js | @magic-spells/tarot-plugins | 0.1.0 (unpublished) | packages/tarot-plugins/dist |
| scrollbar.esm.js, ../styles/vendor/scrollbar.css | @magic-spells/tarot-plugins | 0.1.0 (unpublished) | packages/tarot-plugins/dist (the mobile strip's proportional bar) |
| bottom-sheet.js, ../styles/vendor/bottom-sheet.css | @magic-spells/bottom-sheet | 2.0.2 | npm |
| dialog-panel.js, ../styles/vendor/dialog-panel.css | @magic-spells/dialog-panel | 2.0.3 | npm (bottom-sheet's peer; copied from Folio's vendored copy) |
| dropdown-panel.js, ../styles/vendor/dropdown-panel.css + .effects.css | @magic-spells/dropdown-panel | 2.1.1 | npm |
| select-dropdown.js, ../styles/vendor/select-dropdown.css | @magic-spells/select-dropdown | 0.3.0 | npm |
| collapsible-content.js, ../styles/vendor/collapsible-content.css | @magic-spells/collapsible-content | 1.2.0 | npm |

Tarot and tarot-plugins are unpublished and intentionally absent from package.json. All runtime builds here are imported by theme.ts; all vendor stylesheets are imported into the components layer. CSS lengths other than borders and shadows have been converted from px to rem at 16:1 for the theme rules; JavaScript builds are unchanged.

The adjacent tarot.esm.d.ts and tsconfig exclusion mirror Ledger: TypeScript 7 rejects the valid static private access through this.constructor in the runtime build. The declaration covers the registration-only theme import; node --check validates the unmodified JavaScript.

Spectral fonts are the latin 500, 600 and 800 normal and 400 italic woff2 files from @fontsource/spectral 5.3.0. Only those four files and the package OFL text are included under assets/fonts.
