# Vendored builds

Copied in, by Cory's rule for every Magic Spells component a theme uses: "we copy in the esm file". None of
them is an npm dependency of the theme; the build resolves only these relative imports.

| File | Package | Version | Source |
|---|---|---|---|
| sheet.min.js, ../styles/vendor/sheet.min.css | @magic-spells/sheet | 0.2.0 | npm `dist/` (the ask panel and the menu drawer). The UMD build carries dialog-panel and its physics, frame and morph engines, so it registers the page's one `<dialog-panel>` |
| ../styles/vendor/dialog-panel.css | @magic-spells/dialog-panel | 2.0.3 | npm (the stylesheet only; the script is inside sheet.min.js) |
| sticky-header.js, ../styles/vendor/sticky-header.css | @magic-spells/sticky-header | 0.2.0 | npm |
| scrolling-content.js, ../styles/vendor/scrolling-content.css | @magic-spells/scrolling-content | 2.1.1 | npm (the announcement marquee) |
| select-dropdown.js, ../styles/vendor/select-dropdown.css | @magic-spells/select-dropdown | 0.3.1 | npm (a form select of four options or more; 0.3.1 keeps a long list inside the ask drawer and blocks an empty required select) |
| collapsible-content.js, ../styles/vendor/collapsible-content.css | @magic-spells/collapsible-content | 1.2.0 | npm |
| tarot.esm.js, ../styles/vendor/tarot.css | @magic-spells/tarot | 0.1.0 (unpublished) | tarot monorepo packages/tarot/dist, built 2026-10-31 |

dialog-panel, sticky-header and scrolling-content came from the Clinic theme's vendored copies; collapsible-content
and tarot from the Community theme's; select-dropdown 0.3.1 from the Academy theme's, all byte for byte. Each runtime build is imported by theme.ts,
and each stylesheet into the components layer. CSS lengths other than borders and shadows are rem (sheet.min.css's
twelve px tokens converted at 16:1; Sheet probes every length token, so rem reaches its geometry unchanged);
JavaScript builds are unchanged.

Tarot is unpublished and intentionally absent from package.json. TypeScript 7 rejects one valid line of its runtime
build (a static private field read through `this.constructor`), so tsconfig excludes it and the adjacent
tarot.esm.d.ts types the registration-only import.
