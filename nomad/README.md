# Nomad

A travel journal for one digital nomad. Places and dates come first: every post is pinned to a
place and a day, the home page opens on where the writer is now, and a drawn world map carries the
route through every stop, dashed in arrival order with the next leg dotted. Luggage tags, date
stamps, postmark rings and contour lines decorate it lightly. Besley carries the headings,
Schibsted Grotesk the text and DM Mono the dates, coordinates and counts.

The fixtures are an invented writer, **Ilse Varga**, a product designer on the road since April
2023, so `sites dev` shows 12 places, 4 trips, 12 stops, 14 posts, what three months cost, the kit
she carries and six galleries instead of placeholder text. The photographs and the two video loops
are placeholders; replace them before publishing.

```
settings/theme.json template roles, 3 section groups, Brand, Journal, Traveller, Map and Contact settings
settings/design.json every design token and the Sand, Dusk and Night Train schemes
layouts/default.pzl the <html> document: SEO, the view and reveal pre-paint scripts, skip link, slots
data/templates/     home, blog-list, post, place, trip, page (+ places, trips, photos, gear, uses,
                    about, contact) as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           28, each with a full <schema>
components/         Arrows, Button, Coord, DateStamp, Field, LightboxCompanion, Pin, PlaceRow,
                    PlaceTag, PostCard, Postmark, PostRow, Submit, Tag, Ticket, WorldMap
styles/theme.css    the Tailwind entry: @theme maps the --sites-* tokens, Nomad's role sizes and the
                    decoration tokens, and the few rules utilities cannot express (the ticket notch,
                    the pulse ring, the drop cap, lightbox, carousels, reduced motion)
scripts/theme.ts    the browser JavaScript: component registration, the drawers, the notice, the
                    video loops, the photo strips, the country filter, the hover photographs, the
                    topic filter, the list/grid switch, scroll reveals
scripts/vendor/     the Magic Spells components, copied in (see vendor/VERSIONS.md)
styles/vendor/      the same components' stylesheets
assets/             icons, the drawn world map, the decoration motifs, placeholder photos and loops
locales/en.json     the strings the `t` function reads
sites.fixtures.json Ilse Varga: pages, menus, galleries, forms, places, trips, stops, posts, costs, gear
```

## Content

- **posts** (`/journal/:handle`): Folio's fields (topic, date, author, standfirst,
  image, image_alt, body), plus an optional place, trip, video and photos gallery.
- **places** (`/places/:place`): country, latitude and longitude (decimal, north and east
  positive), image, standfirst, body, timezone, photos.
- **trips** (`/trips/:trip`): start_date, end_date (empty while under way), image, standfirst, body.
- **stops**: one entry per stay, with its trip, place, arrival, nights, post, note and a `next`
  box for the stop still ahead. The route, the itinerary and the footer read them.
- **costs**: place, post, month, category, amount, currency, note. Totals are summed.
- **gear**: group (carry, work, tech or services), weight in grams, verdict, image, link, order.

Dates are calendar days and print as "Oct 7, 2026". Nothing is relative: "since Apr 3, 2023",
never a day counter, and no live clock.

## Sections

- **Global:** announcement bar, header (with the "Now in" line and a Places dropdown), footer (a
  colophon with the route so far), mobile menu (a drawer), cookie notice.
- **Places and routes:** hero ("Currently in", photograph or muted loop under the luggage tag),
  route map, place header, places index, trip header, trip list, itinerary (spine or ribbon of
  tickets), stamp wall, passport.
- **Posts:** post list (grid or list, with the switch and the topic filter), post article,
  author card, start here, cost table.
- **Photos and film:** gallery (strip, grid, columns or one-up), film (a loop or a player).
- **Pages:** page header, rich text, image with text, gear list, faq, newsletter, contact.

Video is always muted, looped and started from the script only in view and never under reduced
motion; the poster shows otherwise. A video over 15 MB is skipped for its poster image.
