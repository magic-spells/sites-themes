# Restaurant

A theme for an all-day neighbourhood restaurant. The menu is the centre of it: every dish has a
card with its photo on top and its name, price, ingredients and dietary codes below, and the
menu shows as tabs, carousels, a full grid by category, a printed-style list and a page per
dish. Book a table opens one booking sheet from anywhere on the site. Bricolage Grotesque
carries the headings, Hanken Grotesk the text and Azeret Mono the prices, hours and codes.

The fixtures are an invented canteen, **Halfmoon Canteen**, 14 Quay Street, Bellport, so `sites
dev` shows six categories, 36 dishes, four events, galleries and three forms instead of
placeholder text. The photographs are SVG placeholders; replace them before publishing.

```
theme.json          template roles, 3 section groups, Brand, Place and Booking settings
design.json         every design token, the six colour schemes and the category tints
layouts/default.pzl the <html> document: SEO, Open Graph, the reveal pre-paint script, skip link, slots
templates/          home, home.cover, dish, page (+ about, contact, events, gallery, menu, menu-list,
                    reservations) as JSON; 404.pzl, password.pzl, maintenance.pzl
groups/             header-group.json, footer-group.json, panel-group.json
sections/           32, each with a full <schema>
components/         Arrows, BookingFields, Button, CategoryCard, Chip, Counter, DietaryBadges,
                    DietaryLegend, DishCard, Door, EventCard, Field, FilterChip, LightboxCompanion,
                    MenuLine, Price, PromoCard, Roundel, Submit
styles/theme.css    the Tailwind entry: @theme maps the --sites-* tokens and Restaurant's role sizes,
                    and the few rules utilities cannot express (selection, focus, lightbox, sheets,
                    carousels before they upgrade)
scripts/theme.ts    the browser JavaScript: component registration, the booking and menu sheets, the
                    notice, the page dim under the Menu panel, carousel counters, the specials
                    docket, the dish-tab filter, grid tiles opening the lightbox, the hero's pause
                    button, the menu rail, scroll reveals
scripts/vendor/     the Magic Spells components, copied in (see vendor/VERSIONS.md)
styles/vendor/      the same components' stylesheets
assets/             Bricolage Grotesque (OFL), icons, the torn docket edge and the placeholder photos
locales/en.json     the strings the `t` function reads
sites.fixtures.json Halfmoon Canteen: pages, menus, galleries, forms, categories, dishes and events
```

## Sections

- **Global:** announcement bar, header (Solid or Overlay; the menu item that links to the Menu
  path opens a panel of the categories from 48rem and dims the page under the header), footer,
  mobile menu and booking panel (both bottom sheets), cookie notice.
- **Menu:** category row (circles or cards), dish tabs (one carousel filtered by a chip per
  category), dish carousel (Start or Centre emphasis), dish grid (every dish by category, with a
  rail of the categories and the dietary legend), menu list (dotted leaders or right prices),
  specials (a kitchen docket beside a fading picture), dish detail, related dishes.
- **Home and content:** hero (Split, or Cover with an optional slideshow), photo links, value
  props (cards or boxes), promo carousel, story, team, gallery strip, gallery grid, events list
  (cards or rows), testimonials (carousel or grid), hours and location, cta band, page header,
  rich text, faq.
- **Forms:** reservations, contact, newsletter.

On a phone no carousel shows arrows: tracks start at the gutter and run past the right edge with
the next card cut. From 48rem every carousel keeps the content column and its gutters and shows
its arrows in the heading row. With JavaScript off every carousel shows its first slide, or its
cards as a row that scrolls.

### Settings worth knowing

- **Book a table** everywhere (header, hero, value props and photo links with Booking on, cta
  band, specials, dish page) opens the booking sheet. With a **Booking URL** set it links there
  instead; without JavaScript it goes to the **Reservations path**.
- Header **Style: Overlay** lies over a page that opens with a Cover hero and cannot stick; the
  `home.cover` template chooses it for you. The header's menu item whose link is the **Menu
  path** opens the categories panel.
- **Dish card** options on every dish section: **Photo** (photo or cutout on a disc), **Info**
  (plain or tinted with the category's tint), and on the carousels **Emphasis: Centre**, which
  centres and raises the card on show.
- A hero, story or page header that opens a page carries its `<h1>`.
- The hero **Slideshow** applies to the Cover layout: it fades through the chosen gallery with
  dots, a counter and a pause button.
- **Events list** sorts by date and shows past dates too (there is no clock); keep the events
  collection current.

## Content contract

Create the content types in the workspace with these handles. Fixtures declare each field's type and label; the theme does not create workspace content types.

| Handle | Entry title | Fields |
| --- | --- | --- |
| `menu_categories` | Category name | `description` text, `image` image, `image_alt` text, `tint` text, numeric position field |
| `menu_items` | Dish name | `description` textarea, `ingredients` text, `price` number, `category` entry pointing to `menu_categories`, `dietary` text, `image` image, `image_alt` text, `featured` checkbox, `tag` text, `photos` gallery, numeric position field |
| `events` | Event name | `date` date, `time` text, `description` richtext, `image` image, `image_alt` text, `link` URL |

The position field's exact identifier is declared in `sites.fixtures.json`. Ingredients are comma-separated. Prices use whole dollars in the sample workspace and the site's `currency_symbol` setting. Dietary codes are comma-separated: `V` vegetarian, `VG` vegan, `GF` gluten free, `DF` dairy free, `N` contains nuts and `HOT` spicy. Check every dietary claim against the kitchen's ingredients before publishing.

The category `tint` field accepts `tomato`, `saffron`, `leaf`, `sea`, `plum` or `clay`. It is a text field rather than a select. An unrecognised value uses the neutral scheme tint. Tint choices follow the category into chips, badges, dots and optional tinted dish information.

Bind a pattern page `/dishes/:dish` to `menu_items` with the `dish` template. Its resolved entry is available as `page.entry`, and its handle binds `request.params.dish`. The fixtures include all 36 explicit dish paths with both entry and parameter data. Chefs and reviews are section blocks; galleries and forms are workspace records.

## Workspace settings

Brand controls the wordmark, favicon, tagline, currency symbol, card reveal and heading case. Place contains the address, phone, email, map link, hours and service strip. Enter hours as seven lines, with a vertical separator between the day and time, such as `Tuesday | 8am – 10pm`.

Booking selects a reservation form, a note and an optional external booking URL. `reservations_path` provides the page target when JavaScript is unavailable. Hero eyebrow and service strip, header phone, and reservation introduction are disabled by default.

The workspace forms are:

- `reservation`: date, then time and party size as selects, then name, email, phone and notes. The engine's field types are text, textarea, email, checkbox and select, so the field id picks the input: `date` is a date picker and `phone` a telephone field. Party choices run from 1 to 8, then “9 or more”.
- `contact`: subject (a select), name, email and message.
- `newsletter`: email.

The reservation success message asks visitors to await an email confirmation. Available time choices in these fixtures are examples, independent of the published opening hours; replace them with the kitchen's actual seating times. The privacy page is a publishing placeholder.

## Type voices

Canteen, the default, uses self-hosted Bricolage Grotesque for headings, Hanken Grotesk for body
text and Azeret Mono for prices, hours and dietary codes. Bricolage uses regular width and
optical size 96; its variable font and OFL licence are under `assets/fonts/`.

Change the font roles in the workspace design editor. The three other voices are Trattoria
(Gloock 400 headings), Salon (Libre Caslon Display 400 headings, Hanken Grotesk 300–400 body)
and Diner (Fredoka 600–700 headings). Keep Azeret Mono for the mono role. Salon reads well with
uppercase headings through the **Heading case** setting. These are guidance, not presets.

## Fixtures and assets

Fixtures contain six categories, 36 dishes, eight featured dishes, six tags, four dated events and 46 page paths. `home-hero` has four landscape images; `the-room` has eight mixed-ratio images. Brown butter pancakes, Harbour fish stew and Grain bowl each have a five-image gallery. Placeholder SVGs include all six category tints at 4:3, plus 4:5, 3:2, 1:1, 2:3, 16:9 and a transparent cutout. Replace them with photography before publishing, retaining appropriate aspect ratios and alt text. Portraits are confined to portrait or mixed-ratio contexts.

Menus use `main`, `categories`, `legal` and `social`. Section collection settings and path settings keep content handles and destinations editable. The source includes the vendored component versions recorded in `scripts/vendor/VERSIONS.md`; their files remain local ESM assets.

## Running it

```sh
npm install                                   # vite, @tailwindcss/vite and TypeScript
SITES_BUILDER_DIR=<engine>/tools/builder sites dev ./restaurant --addr 127.0.0.1:3312
SITES_BUILDER_DIR=<engine>/tools/builder sites check ./restaurant
```

`sites check` compiles the theme, builds the CSS and JavaScript and type-checks `scripts/`; the
theme has no separate test command.

## The vendored components

Tarot (the carousels) with its lightbox, lazy-load and scrollbar plugins, and the bottom-sheet,
dialog-panel, dropdown-panel, select-dropdown, collapsible-content, sticky-header, tab-group and
reveal components are copied into `scripts/vendor/` and `styles/vendor/`, because the theme
build resolves only the builder's own packages. `scripts/vendor/VERSIONS.md` lists each file's
package and version. To move one to npm once the engine links a theme's installs: add the
package at that version to `package.json`, change its import in `scripts/theme.ts` and
`styles/theme.css` to the package path (for tarot, `@magic-spells/tarot` and
`@magic-spells/tarot/css`; for a plugin, `@magic-spells/tarot-plugins/<name>`), and delete the
vendored files and, for tarot, `tarot.esm.d.ts` and the `tsconfig.json` exclusion.

## Known limits

- The lightbox has no public `open(index)`, so the gallery grid renders a visually hidden copy
  of its photographs as a carousel (`LightboxCompanion`) and a tile clicks that carousel's
  slide; focus returns to the tile on close.
- `date()` has no weekday, so event badges show the day and month; put a weekday in the event's
  time text if you want one.
- The gallery strip gives every photo the same width and lets its height follow the photo's
  ratio; tarot has no per-slide widths.
- The header's Menu panel shows no dish counts: the header has no dish collection setting.
- Wine and navy promo roundels use the tomato and sea tints, the nearest of the six.

Licensed under MIT; the font and vendored components keep their own included licences.
