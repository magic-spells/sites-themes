# Ledger

Schema layer for The Daily Ledger, an invented local newsroom. Section bodies and the 404, password and maintenance templates are placeholders for D5.

The `posts` contract preserves `topic`, `date`, `author`, `reading_minutes`, `standfirst`, `image`, `image_alt` and `body`; optional additions are `image_credit`, `updated` and `key_facts` (one fact per non-empty line). Publication and update metadata use calendar dates only.

Shared section setting ids and the theme’s `writer_*` ids are preserved for workspace theme switching; the latter are labelled Editor. `topic-block` with `exclude_current` and an empty topic uses the current story’s topic. List-style sections retain `show_images`, `show_toggle`, `offset` and `columns`.

Fixtures contain sixteen stories by Priya Nand and Tom Reilly, six topics, eight landscape SVG placeholders and two author portraits. Headlines, authored deks and credits come from the Figma dump. Where it supplies no authored dek, a short title-derived summary stands in. Food maps to Business; Data to Science; Community to Politics; Travel, TV and Film to Culture; Explainer to Weather. Other named reporters are normalized to the two fixture authors; photo credits remain as supplied.

There are no topic archives: topic menus link to a representative story. About, advertising, corrections, privacy and social menus are provided; advertising and corrections use the contact page’s anchors.

D5 must implement the carousel with Tarot’s core effect and navigation. Below 48rem the section has no horizontal padding: track padding-left and scroll-padding-left use the gutter, padding-right is zero. Tablet and desktop restore both gutters. Arrows show from tablet up. The rule row is a separate 3px strong rule inside the gutter.

Tarot 0.1.0 is temporarily vendored in `scripts/vendor/tarot.esm.js` and `styles/vendor/tarot.css`, each with `TAROT-LICENSE` alongside. Neither is imported yet. The unimported Tarot bundle is excluded from the D4 TypeScript check: TypeScript 7 rejects its private static-field access at `_.constructor.#getPluginKey` (the supplied JavaScript passes `node --check`). D5 must resolve that integration diagnostic before importing it. Replace with the npm release when available. The license is the package’s own; Ledger’s root LICENSE covers the theme code. Dialog, sticky-header and reveal distributions and `scripts/theme.ts` are copied unchanged from Folio.

```sh
npm install
sites check .
sites dev . --addr 127.0.0.1:3951
```
