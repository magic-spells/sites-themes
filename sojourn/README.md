# Sojourn

A theme for a small place to stay: a handful of cabins, a small inn, a farmhouse with rooms, a
hostel. The stays are the centre of it: each a card with its photo, its price on a paper chip,
its facts on one line ("Sleeps 4 · 1 queen, 2 twins · 1 bath") and a page with the photo
mosaic, the amenities, the things to know and its reviews. Booking is the workspace's own
booking app: a link from every Check availability button and, on the booking band, the app
itself in a frame. Figtree carries the type on seven schemes, from paper and white to night,
forest, lake, sunset and brick, with line glyphs for 24 amenity words.

The fixtures are an invented place, **Fern Hollow** on Okanagan Lake, so `sites dev` shows
eight stays, nine things to do, eight reviews, six posts, the galleries and two forms instead of
placeholder text. The photographs are SVG placeholders; replace them before publishing.

```
settings/theme.json template roles, 3 section groups, Brand, Place and Contact settings
settings/design.json every design token and the seven colour schemes
layouts/default.pzl the <html> document: SEO, Open Graph, the reveal pre-paint script, skip link, slots
data/templates/     home, stay, experience, post and page (+ about, contact, explore, gallery,
                    journal, policies, stays) as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           32, each with a full <schema>
components/         the shared pieces: Accent, Amenity, Arrows, Button, ExploreCard, FactsLine,
                    Field, FormFields, Glyph, LightboxCompanion, PostCard, Price, PriceChip,
                    Questions, ReviewCard, SectionHead, StayCard, Utility, Well
styles/theme.css    Tailwind with every token in @theme
scripts/theme.ts    the vendored components and the small behaviours they leave out
assets/             Figtree (OFL), glyphs.svg, the favicon, the placeholders, embed.html
```

## Content

- **stays**: type, summary, description, sleeps, bedrooms, beds, baths, amenities (one per
  line), highlights ("Title: sentence", one per line), price_night, price_week, price_unit
  (night or bed), min_nights, image, image_alt, photos, featured, order. Page `/stays/:stay`.
- **experiences**: kind (here, nearby or trip), summary, description, distance, season, price,
  link, image, image_alt, featured, order. Page `/explore/:experience`.
- **reviews**: quote, name, place, date, stay, rating, featured, order.
- **posts**: topic, date, author, standfirst, image, image_alt, body. Page `/journal/:post`.

Everything about the place (address, check-in and check-out, the season, house rules,
cancellation, pets, parking, booking) is set once in the Place settings.

## Booking

Place booking is Link, Embed or Both. Link sends every booking button to the booking URL in a
new tab. Embed puts the booking app on the booking band: set the embed URL to the address of
the app's booking page and the height it needs; the theme prints its own frame for it. The
frame takes a page address, not a pasted script.

## Develop

```
sites check ./sojourn
sites dev ./sojourn
```
