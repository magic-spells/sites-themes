# Circuit

A theme for a gym, a studio, a personal trainer or a run club. Classes are the centre of it:
every class has a card with its photo on top, a tag over the corner and a strip of three cells
for duration, intensity (ticks) and level, and the week shows as a timetable with a column per
day and a chip per session. Start free trial opens one trial sheet from anywhere on the site.
Archivo at a wide stretch carries the headings and the text, Martian Mono the times, specs and
labels; the accent is one flare orange, and bands can meet at a 12° slash.

The fixtures are an invented gym, **Common Ground**, Foundry Lane, with a North and a Riverside
location, so `sites dev` shows 14 classes, 63 sessions, six coaches, six plans, eight events,
six albums and three forms instead of placeholder text. The photographs are SVG placeholders;
replace them before publishing.

```
settings/theme.json template roles, 3 section groups, Brand, Floor and Contact settings
settings/design.json every design token and the five colour schemes (white, black, graphite,
                    concrete, flare)
layouts/default.pzl the <html> document: SEO, Open Graph, the reveal pre-paint script, skip link, slots
data/templates/     home (Gym), page.trainer, page.club, class, coach, event, album, location,
                    page (+ about, classes, coaches, contact, events, gallery, locations,
                    memberships, timetable, trial) as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           36, each with a full <schema>
components/         AlbumTile, Arrows, Button, ClassCard, CoachCard, DateBlock, EventCard, Field,
                    FormFields, HoursTable, LightboxCompanion, LocationCard, Photo, PlanCard,
                    SectionHead, SessionChip, Submit, Ticks
styles/theme.css    the Tailwind entry: @theme maps the --sites-* tokens and Circuit's role sizes,
                    and the few rules utilities cannot express (the slash edge, the ticker, the
                    textures, the width axis, sheets and carousels before they upgrade)
scripts/theme.ts    the browser JavaScript: component registration, the trial and menu sheets, the
                    notice, the timetable's class filter, grid tiles opening the lightbox, the
                    hero's pause button, scroll reveals
scripts/vendor/     the Magic Spells components, copied in (see vendor/VERSIONS.md)
styles/vendor/      the same components' stylesheets
assets/             Archivo (OFL), icons, the grain tile and the placeholder photos
locales/en.json     the strings the `t` function reads
sites.fixtures.json Common Ground: pages, menus, galleries, forms, classes, sessions, coaches,
                    locations, plans, events and albums
```

## Front pages

Three templates can open the site: **Gym** (`home`, the default: cover hero, ticker, classes,
numbers, the week, coaches, plans, members, meet-ups, locations), **Trainer** (`page.trainer`:
a split portrait hero, the head coach, the method in three boxes, packages and small-group
sessions) and **Club** (`page.club`: meet-ups first, the weekly runs, where the club talks and
the run leaders).

## Settings worth knowing

- **Start free trial** everywhere (header, hero, cta band, class, coach and location pages)
  opens the trial sheet. With a **Booking URL** set it links there instead; without JavaScript
  it goes to the **Trial path**.
- Header **Style: Over the hero** lies over a page that opens with a Cover hero until the page
  scrolls, then turns solid.
- **Slash** on a cta band or ticker cuts its top edge at 12° over the band above.
- **Ghost word** prints one huge outlined word behind a hero or cta band; the Brand setting is
  the default.
- **Ticker lines** (Floor) fill every ticker that has no phrase blocks.
- A hero, story or page header that opens a page carries its `<h1>`.
- Lists show at most 12 items with "N of M" and a view-all link.
- **Events list** sorts by date and shows past dates too (there is no clock); keep the events
  collection current.

## Content contract

Create the content types in the workspace with these handles. Fixtures declare each field's
type and label; the theme does not create workspace content types.

| Handle | Entry title | Fields |
| --- | --- | --- |
| `classes` | Class name | `summary`, `description`, `level`, `intensity`, `duration_minutes`, `format`, `coach` (entry to `coaches`), `image`, `image_alt`, `photos` gallery, `what_to_bring`, `who_for`, `price`, `featured`, `tag`, `order` |
| `sessions` | Label | `class` (entry to `classes`), `day` (`mon`…`sun`), `start`, `end` (text, `06:30`), `coach` (entry), `location` (entry to `locations`), `note` |
| `coaches` | Name | `role`, `bio`, `specialties`, `credentials`, `image`, `image_alt`, `image_wide`, `image_wide_alt`, `link`, `featured`, `order` |
| `locations` | Name | `address`, `hours` (one line per day, the times last), `phone`, `email`, `map_url`, `map_image`, `map_image_alt`, `image`, `image_alt`, `description`, `note`, `order` |
| `plans` | Name | `price`, `period` (`month`, `week`, `session`, `pack`, `once`, `free`), `summary`, `features` (one per line; the comparison table ticks a plan for each line it has), `featured`, `note`, `link`, `order` |
| `events` | Name | `date`, `time`, `location`, `description`, `route`, `pace`, `image`, `image_alt`, `link`, `album` (entry to `albums`) |
| `albums` | Name | `date`, `event` (entry), `cover`, `cover_alt`, `photos` gallery, `description` |

`level` is `all`, `beginner`, `intermediate` or `advanced`; `intensity` is `low`, `moderate`
or `high`; `format` is `group`, `small-group`, `outdoor`, `open-gym` or `one-to-one`. They are
text fields rather than selects, because content fields carry no options.

Bind pattern pages `/classes/:class`, `/coaches/:coach`, `/events/:event`, `/gallery/:album`
and `/locations/:location` to their collections with the `class`, `coach`, `event`, `album`
and `location` templates. The fixtures list every detail path with its entry.

## Workspace forms

- `trial`: name, email, phone, goal, class, location and notes. Goal, class and location are
  selects; a select with one option is hidden.
- `contact`: name, email, subject (a select) and message.
- `newsletter`: email.

## Running it

```sh
npm install                                   # vite, @tailwindcss/vite and TypeScript
SITES_BUILDER_DIR=<engine>/tools/builder sites dev ./circuit --addr 127.0.0.1:3316
SITES_BUILDER_DIR=<engine>/tools/builder sites check ./circuit
```

## Known limits

- Tarot has no autoscroll, so the ticker is a CSS marquee (paused on hover and under reduced
  motion).
- `date()` has no weekday, so the date block works it out from the ISO date.
- The lightbox has no public `open(index)`, so album grids render a visually hidden copy of
  their photographs as a carousel (`LightboxCompanion`).
- The Flare scheme keeps black text on the accent, so a recoloured accent needs enough contrast
  with black; the suggested palettes (Flare, Volt) both do.

Licensed under MIT; the font and vendored components keep their own included licences.
