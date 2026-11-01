# Changelog

## 0.2.0

- The theme keeps `theme.json` and `design.json` in `settings/` and its templates and section
  groups in `data/`.
- Every section names a `kind` and a Lucide `icon`, so the Add-section picker groups it and
  draws its icon.
- The panel group is labelled Panel.
- A section whose color scheme defaulted to the first scheme now has no default and follows the
  site's base scheme; sections that default to another scheme keep it: the announcement bar and
  newsletter keep `ink`, the author card and pull quote `tint`, and the page header and footer
  `cream`.
- The starter templates, section groups and presets no longer store the first scheme, so a new
  site's sections follow its base scheme too.

## 0.1.0

- First release of Folio, a journal theme for one writer.
- Sixteen sections, nine templates, three groups, four color schemes and three suggested palettes.
- The Slow Mile fixtures: thirteen essays, an about page, a contact page and a privacy page.
- Post list with an `offset` setting (skip the newest 0 to 3), used by the home page's
  Recent list so it does not repeat the featured essay.
- Post list rows carry a 3:2 thumbnail (`show_images`, on by default; an entry without a
  picture keeps an empty well so the rows line up). `show_toggle` adds a list/grid switch
  for readers: the editor's layout shows first, and the reader's choice is remembered and
  applied before the page paints. The switch stays hidden without JavaScript.
  The journal index turns both on; More to read turns the thumbnails off.
- Every fixture post has a picture now, four of them with captions.
- The journal and home pages open on the featured essay, then the posts after it as a grid of
  two cards per row (Recent and Index presets: `layout: "grid"`, `columns: "2"`). Grid rows sit
  a full step apart (`step-xl`) so each card reads on its own.
- Scroll reveals (`reveal_on_scroll` in Brand, on by default): post cards and rows fade up with
  a 50 ms stagger, as do the author card, newsletter, contact, image with text and pull quote.
  Built on `@magic-spells/reveal` 0.1.1 (vendored, Tailwind entry). Anything on screen at
  first paint shows at once; reduced motion, no JavaScript or a failed script show everything.
- Mobile menu and sticky header built on `@magic-spells/dialog-panel` 2.0.3 and
  `@magic-spells/sticky-header` 0.2.0.
- Newsreader roman and italic self-hosted under the OFL; IBM Plex Mono for labels.
