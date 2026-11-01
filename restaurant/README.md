# Restaurant

Restaurant 0.1.0 is a reference theme for an all-day neighbourhood restaurant. Its fixture workspace is Halfmoon Canteen, 14 Quay Street, Bellport. This schema release contains the complete settings, content contract, template stacks, tokens and sample data. Section bodies and the restaurant-specific components are deliberately labelled placeholders for the markup phase.

Every section exposes a colour scheme. The six schemes are Paper (the default), White, Charcoal, Tomato, Wine and Navy. Category tints belong on small details and optional tinted dish information; category and promo card bodies use the scheme surface. Dish photos sit above their information. The Home stack places the menu immediately below the hero and the red information band near the bottom.

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

Booking selects a reservation form, a note and an optional external booking URL. `reservations_path` provides the page target when JavaScript is unavailable. The markup phase will connect booking buttons to the shared booking panel or the external URL. Hero eyebrow and service strip, header phone, and reservation introduction are disabled by default.

The workspace forms are:

- `reservation`: name, email, phone and date as text-compatible fields; time and party size as selects; notes as textarea. Party choices run from 1 to 8, then “9 or more”.
- `contact`: name, email, subject select and message.
- `newsletter`: email.

The reservation success message asks visitors to await an email confirmation. Available time choices in these fixtures are examples, independent of the published opening hours; replace them with the kitchen's actual seating times. The privacy page is a publishing placeholder.

## Type voices

Canteen uses self-hosted Bricolage Grotesque for headings, Hanken Grotesk for body text and Azeret Mono for prices, hours and dietary codes. Bricolage uses regular width and optical size 96 to match the reference renders. Its variable font and OFL licence are included under `assets/fonts/`.

The workspace design editor can change font roles. The three documented alternatives are Trattoria (Gloock 400 headings), Salon (Libre Caslon Display 400 headings, Hanken Grotesk 300–400 body) and Diner (Fredoka 600–700 headings). Keep Azeret Mono for the mono role. Salon may use uppercase headings through `heading_case`; these voices are guidance, not selectable theme presets.

## Fixtures and assets

Fixtures contain six categories, 36 dishes, eight featured dishes, six tags, four dated events and 46 page paths. `home-hero` has four landscape images; `the-room` has eight mixed-ratio images. Brown butter pancakes, Harbour fish stew and Grain bowl each have a five-image gallery. Placeholder SVGs include all six category tints at 4:3, plus 4:5, 3:2, 1:1, 2:3, 16:9 and a transparent cutout. Replace them with photography before publishing, retaining appropriate aspect ratios and alt text. Portraits are confined to portrait or mixed-ratio contexts.

Menus use `main`, `categories`, `legal` and `social`. Section collection settings and path settings keep content handles and destinations editable. The source includes the vendored component versions recorded in `scripts/vendor/VERSIONS.md`; their files remain local ESM assets.

## Development

Install the theme's development dependencies with `npm install`, then run the engine's `sites check ./restaurant` from the repository root. Set `SITES_BUILDER_DIR` to the engine's `tools/builder` directory so the check includes the CSS, JavaScript and TypeScript build. For local preview use `sites dev ./restaurant --addr 127.0.0.1:3312` with the same environment variable. This theme has no separate test command.

Licensed under MIT; the font and vendored components retain their own included licences.
