# Vendored builds

Copied in, by Cory's rule for every Magic Spells component a theme uses: "we copy in the esm file". None of
them is an npm dependency of the theme; the build resolves only these relative imports.

| File | Package | Version | Source |
|---|---|---|---|
| tarot.esm.js, ../styles/vendor/tarot.css | @magic-spells/tarot | 0.1.0 (unpublished) | tarot monorepo packages/tarot/dist, built 2026-10-31 |
| lightbox.min.js, ../styles/vendor/lightbox.css | @magic-spells/tarot-plugins | 0.1.0 (unpublished) | packages/tarot-plugins/dist (the UMD build carries morph-engine 0.4.2) |
| dialog-panel.js, ../styles/vendor/dialog-panel.css | @magic-spells/dialog-panel | 2.0.3 | npm (the menu drawer) |
| dropdown-panel.js, ../styles/vendor/dropdown-panel.css | @magic-spells/dropdown-panel | 2.1.1 | npm |
| select-dropdown.js, ../styles/vendor/select-dropdown.css | @magic-spells/select-dropdown | 0.3.0 | npm |
| collapsible-content.js, ../styles/vendor/collapsible-content.css | @magic-spells/collapsible-content | 1.2.0 | npm |
| sticky-header.js, ../styles/vendor/sticky-header.css | @magic-spells/sticky-header | 0.2.0 | npm |
| scrolling-content.js, ../styles/vendor/scrolling-content.css | @magic-spells/scrolling-content | 2.1.1 | npm (the announcement marquee) |
| reveal.js, ../styles/vendor/reveal.css | @magic-spells/reveal | 0.1.1 | npm |
| split-text.esm.js, ../styles/vendor/split-text.css | @magic-spells/split-text | 0.2.0 | npm (the headings that rise in) |

All copied from the Clinic, Ritual and Circuit themes' vendored copies. Tarot and its lightbox are unpublished and intentionally absent from package.json. All runtime builds here are imported by theme.ts; all vendor stylesheets except reveal's are imported into the components layer. CSS lengths other than borders and shadows are rem, except reveal.css's own px defaults; JavaScript builds are unchanged.

The adjacent tarot.esm.d.ts and tsconfig exclusion mirror the other themes: TypeScript 7 rejects the valid static private access through this.constructor in the runtime build. The declaration covers the registration-only theme import.
