# Vendored builds

Copied in, by Cory's rule for every Magic Spells component a theme uses: "we copy in the esm file". None of
them is an npm dependency of the theme; the build resolves only these relative imports.

| File | Package | Version | Source |
|---|---|---|---|
| tarot.esm.js, ../styles/vendor/tarot.css | @magic-spells/tarot | 0.1.0 (unpublished) | tarot monorepo packages/tarot/dist, built 2026-10-31 |
| lightbox.min.js, ../styles/vendor/lightbox.css | @magic-spells/tarot-plugins | 0.1.0 (unpublished) | packages/tarot-plugins/dist (the UMD build carries morph-engine 0.4.2) |
| progress-bar.esm.js, ../styles/vendor/progress-bar.css | @magic-spells/tarot-plugins | 0.1.0 (unpublished) | packages/tarot-plugins/dist and dist/css (the card carousels' progress bar) |
| sheet.min.js, ../styles/vendor/sheet.css | @magic-spells/sheet | 0.2.0 | npm (the ask sheet; the UMD build, which carries dialog-panel 2.0.2, physics-engine, frame-engine and morph-engine 0.1.2, so it is the page's one dialog-panel, the menu drawer's too. Its ESM imports those four by bare name, which the theme build cannot resolve; the ESM plus vendored engines built to the same gzip size) |
| ../styles/vendor/dialog-panel.css | @magic-spells/dialog-panel | 2.0.3 | npm (the stylesheet only, unchanged since 2.0.2; the script is inside sheet.min.js) |
| dropdown-panel.js, ../styles/vendor/dropdown-panel.css | @magic-spells/dropdown-panel | 2.1.1 | npm |
| select-dropdown.js, ../styles/vendor/select-dropdown.css | @magic-spells/select-dropdown | 0.3.1 | npm |
| collapsible-content.js, ../styles/vendor/collapsible-content.css | @magic-spells/collapsible-content | 1.2.0 | npm |
| sticky-header.js, ../styles/vendor/sticky-header.css | @magic-spells/sticky-header | 0.2.0 | npm (copied from Folio's vendored copy) |
| scrolling-content.js, ../styles/vendor/scrolling-content.css | @magic-spells/scrolling-content | 2.1.1 | npm (the announcement ticker; copied from Nomad's vendored copy) |
| reveal.js, ../styles/vendor/reveal.css | @magic-spells/reveal | 0.1.1 | npm (copied from Folio's vendored copy) |
| split-text.esm.js, ../styles/vendor/split-text.css | @magic-spells/split-text | 0.2.0 | npm (the headings that rise in, under the reveal switch) |
| tab-group.js, ../styles/vendor/tab-group.css | @magic-spells/tab-group | 1.2.0 | npm (the esm build; the timetable's day tabs below 64rem) |

Tarot and tarot-plugins are unpublished and intentionally absent from package.json. All runtime builds here are imported by theme.ts; every vendor stylesheet but reveal.css (whose @utility rules must stay unlayered) is imported into the components layer. CSS lengths other than borders and shadows have been converted from px to rem at 16:1 for the theme rules, except reveal.css, whose motion distances, blur and perspective stay in px as published; JavaScript builds are unchanged apart from the provenance comment at the top of reveal.js and sticky-header.js.

The adjacent tarot.esm.d.ts and tsconfig exclusion mirror Ledger and Restaurant: TypeScript 7 rejects the valid static private access through this.constructor in the runtime build. The declaration covers the registration-only theme import; node --check validates the unmodified JavaScript.

