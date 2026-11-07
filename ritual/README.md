# Ritual

A theme for a day spa, a salon, a massage or skin studio, or a small yoga and pilates room. The
menu is the centre of it: every service sits on one dotted line, its name, its time and its
price, with add-ons indented under it, grouped by category and filtered by tabs. One shape runs
through the rest: the portal, an arch over every portrait and a capped top over every
landscape; the capsule, a tall photo rounded at both ends, is the editorial accent (the
Capsules hero and gallery strip, the newsletter photo, the small portraits). Book opens one appointment request from anywhere on the site, a sheet on a phone and
a dialog from tablets, or links out to a booking page. Gloock carries the headings with one word
of each in the accent, Albert Sans the text, on nine warm schemes from linen to terracotta.

The fixtures are an invented house, **Juniper House** on Alder Street, with a second, smaller
studio at Riverside, so `sites dev` shows six categories, 34 services, six people, three
packages, six testimonials, four albums (one before and after), four events, six product lines,
six posts and three forms instead of placeholder text. The photographs are SVG placeholders;
replace them before publishing.

```
settings/theme.json template roles, 3 section groups, Brand, House and Contact settings
settings/design.json every design token and the nine colour schemes (linen, sand, clay, fern,
                    fig, celadon, sea, slate, terracotta)
layouts/default.pzl the <html> document: SEO, Open Graph, the reveal pre-paint script, skip link, slots
data/templates/     home (Day spa), service, member, album, event, location, post and page (+ about,
                    book, contact, events, gallery, gift-cards, journal, locations, packages,
                    policies, services, team) as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           41, each with a full <schema>
components/         Accent, AlbumTile, Arrows, Button, EventCard, Field, FormFields, HoursTable,
                    LightboxCompanion, LocationCard, PackageCard, PictureText, PostCard, Price,
                    Questions, SectionHead, ServiceCard, ServiceLine, Stamp, TeamCard, Well
styles/theme.css    the Tailwind entry: @theme maps the --sites-* tokens and Ritual's role sizes,
                    and the few rules utilities cannot express (the dome edge, the grain, the
                    booking dialog from 48rem, sheets and carousels before they upgrade)
scripts/theme.ts    the browser JavaScript: component registration, the booking and menu panels,
                    a sent request reopening its panel, the notice, the menu's folding groups,
                    the journal's view switch, grid tiles opening the lightbox, pause buttons,
                    scroll reveals
scripts/vendor/     the Magic Spells components, copied in (see vendor/VERSIONS.md)
styles/vendor/      the same components' stylesheets
assets/             Gloock and Albert Sans (OFL), icons, the grain tile and the placeholder photos
locales/en.json     the strings the `t` function reads
sites.fixtures.json Juniper House: pages, menus, galleries, forms, categories, services, team,
                    locations, packages, testimonials, albums, events, products and posts
```

## Writing headings

Every heading setting marks its accent word with asterisks: `Come in and *breathe*` prints
"breathe" upright in the scheme's accent colour. One word per heading.

## Content

- **categories**: the menu's groups. The line under each name ("Six kinds, 50 to 90 minutes")
  shows on the photo doors and in the Services panel; the note sits beside the group's name on
  the menu.
- **services**: category, summary, description, duration, price and whether it is a starting
  price ("from"), add-ons one per line as `Name · 15 min · +$20`, what it includes, who offers
  it, a photo (the category's stands in), most booked, a tag and a position.
- **team**, **locations**, **packages**, **testimonials**, **albums** (a `before-after` album's
  photos are read in pairs), **events**, **products** and **posts** as their sections describe.

A service names one person under Offered by: there is no field for several entries, so the
person who leads it is the one the service page and the person's page link to.

The social section shows square tiles the workspace uploads, each linking to its post or to the
profile. Sections cannot fetch, so a live feed would be an engine feature.

## Booking

House → Booking chooses the request form (the booking panel, and the `/book` page for a
visitor without JavaScript) or a link to a booking page. The panel's form is a site form with
the fields service, day, time, name, phone and note; the id picks the input, so `day` is a date
and `phone` a telephone field.
