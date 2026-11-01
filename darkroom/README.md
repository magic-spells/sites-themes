# Darkroom

A photography theme for one photographer. The home page opens on a full-bleed slideshow, the
work is a list (or grid) of series, and each series is a page of photographs: a carousel, a
strip that breaks the column, a grid and single frames, all opening into a full-screen
lightbox. Spectral carries the headings, Familjen Grotesk the text, Fragment Mono the labels.

The fixtures are an invented documentary photographer, **Mara Lindqvist** of Gothenburg, so
`sites dev` shows six series, an about page, prints, packages, a live gallery in three layouts
and a contact form instead of placeholder text. The photographs are twelve SVG studies reused
across every gallery; replace them before publishing.

```
settings/theme.json template roles, 3 section groups, Brand, Photographer and Contact settings, query ["subject"]
settings/design.json every design token, 3 color schemes (Darkroom, Gallery, Matte), 3 suggested palettes
layouts/default.pzl the <html> document: SEO, Open Graph, the series view pre-paint script, skip link, five slots
data/templates/     home, work, series, page (+ about, prints, contact, packages, gallery-masonry,
                    gallery-grid, gallery-carousel) as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           26, each with a full <schema>
components/         Button, Field, Chip, Counter, LightboxCompanion, PhotoTile, SeriesCard, SeriesRow,
                    ServiceTile
styles/theme.css    the Tailwind entry: @theme maps --sites-* tokens and Darkroom's role sizes, and the
                    few rules utilities cannot express (fonts, statement italics, lightbox, sheet, carousels)
scripts/theme.ts    the browser JavaScript: component registration, menu sheet, notice, view switch,
                    counters, grid tiles opening the lightbox, the hero's pause button, the page dim
                    under an open dropdown
scripts/vendor/     the Magic Spells components, copied in (see vendor/VERSIONS.md)
styles/vendor/      the same components' stylesheets
assets/             Spectral (OFL, see fonts/OFL-Spectral.txt), icons and the twelve photo studies
locales/en.json     the strings the `t` function reads
sites.fixtures.json Mara Lindqvist: pages, menus, galleries, a form and six series
```

## Sections

- **Global:** header (Solid or Overlay, the Work menu opens a panel of series covers from 48rem
  and dims the page under the header while it is open), footer, mobile menu (a bottom sheet), cookie notice.
- **Work:** hero slideshow (an autoplaying one has a pause button beside its counter), series index (grid or list, with an optional list/grid switch the
  reader's choice is remembered for), series header, series nav.
- **Photos:** photo carousel, photo grid, photo single, photo pair, photo masonry, photo strip.
  Carousel and strip open the lightbox from a click and fly the picture into place; grid and
  masonry tiles open it with a fade (see below).
- **Content:** page header, rich text, image with text, statement, figures, cv list,
  testimonials (from 48rem two synced carousels: the quote slides in and leads, the photograph
  fades to follow; below that one carousel with the photograph in each slide), services, prints
  band, faq.
- **Forms:** contact (Subject preselected from `?subject=`, which each service tile links with),
  packages (rows or tiles).

On a phone no carousel shows arrows: strips start at the gutter and run past the right edge,
one-ups show the next slide at the edge, a 1px bar tracks the services and photo strips, and
testimonials show dots. From 48rem every carousel keeps the content column and its gutters and
is clipped at the column's edges.

A photo tile on hover (services, series cards, package tiles, the Work panel's covers) grows
past its hover scale and settles, while its scrim and text fade in; under reduced motion only
the fade runs. The durations and curves are `@theme` tokens in `theme.css`.

### Settings worth knowing

- Header **Style: Overlay** lies over a page that opens with a hero slideshow and is solid
  elsewhere. The header's menu item whose link is the **Work path** opens the series panel.
- **Photo carousel, grid, strip and masonry** with no gallery chosen show the photographs of the
  series the page is bound to. **Photo single** and **photo pair** with no image chosen take a
  photograph from that series by its index, so one series template serves every series.
- **Hero slideshow** captions that start with a series title ("Salt Roads · Bonneville") take
  that series' place, year and link; the link is the **Base path** plus the series handle.
- **Header Sticky** keeps the header at the top while scrolling, except the Overlay style over
  an opening hero slideshow, which lies on the photograph and scrolls away with it.
- **Mobile menu** lists the series of its **Collection** under the menu item that links to its
  **Work path**.
- **Prints band** has an **Eyebrow** above its heading; **image with text** a **Caption** line
  under its body (the About page sets it to the representation).
- A hero slideshow or image with text that opens a page carries the page's `<h1>` for screen
  readers.

## The series content type

Create it in the workspace as `series`, bind the pattern page `/work/:series` to the `series`
template, and give it these fields: `year` (text), `location` (text), `statement` (richtext),
`cover` (image), `cover_alt` (text), `photos` (gallery) and `edition_note` (text). Series are
ordered by `year`, newest first. The header and the mobile menu list them from their
**Collection** setting under the menu item that links to their **Work path**.

## Running it

```sh
npm install       # vite, @tailwindcss/vite and TypeScript
sites dev .       # serves the fixtures
sites check .     # compiles the theme and type-checks scripts/
```

## The vendored components

Tarot (the carousels) with its lightbox, lazy-load and scrollbar plugins, and the bottom-sheet,
dialog-panel, dropdown-panel, select-dropdown and collapsible-content components are copied into
`scripts/vendor/` and `styles/vendor/`, because the theme build resolves only the builder's own
packages. `scripts/vendor/VERSIONS.md` lists each file's package and version. To move one to
npm once the engine links a theme's installs: add the package at that version to
`package.json`, change its import in `scripts/theme.ts` and `styles/theme.css` to the package
path (for tarot, `@magic-spells/tarot` and `@magic-spells/tarot/css`; for a plugin,
`@magic-spells/tarot-plugins/<name>`), and delete the vendored files and, for tarot,
`tarot.esm.d.ts` and the `tsconfig.json` exclusion.

The lightbox has no public `open(index)` yet, so the grid and masonry render a visually hidden
copy of their photographs as a carousel (`LightboxCompanion`) and a tile clicks that carousel's slide; the plugin
finds nothing on screen to fly from and fades in, and focus returns to the tile on close. Once tarot-plugins gains
`open(index, sourceElement)` the tiles can fly too.
