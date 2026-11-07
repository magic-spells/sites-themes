# Circuit

## 0.2.0

- Every section names a `kind` and a Lucide `icon` that match the other themes' (the page header
  is a Hero; the cookie notice, mobile menu, newsletter, testimonials, CTA band and the class,
  coach, event, location, plan and timetable sections draw their own icons), so the Add-section
  picker groups them and draws their icons.
- The panel group is labelled Panel.
- A section whose color scheme defaulted to the first scheme now has no default and follows the
  site's base scheme; sections that default to another scheme keep it: the header, footer, hero,
  plans and stats keep `black`; the page header, FAQ, locations and timetable `concrete`; the
  announcement bar, ticker, CTA band and community links `flare`; the newsletter and value props
  `graphite`.
- The starter templates, section groups and presets no longer store the first scheme, so a new
  site's sections follow its base scheme too. A stored `white` that overrides its section's own
  default (the header, the plans, the FAQ, the locations and the timetable on some pages, and
  the header's presets) keeps its value.

## 0.1.0

- 36 sections: the global header, footer, announcement, ticker, mobile menu, trial sheet and
  cookie notice; class, timetable, coach, plan, location, event and album sections built on
  one class card and one session chip; home, content and form sections.
- Gym, Trainer and Club front pages; class, coach, event, album and location pages; classes,
  timetable, coaches, memberships, events, gallery, locations, about, trial, contact and page
  templates; the 404, password and maintenance pages.
- Five colour schemes (white, black, graphite, concrete, flare) that follow the palette
  (links in its secondary, a dark shade of the accent), the Flare and Volt palettes, the 12°
  slash edge, halftone and grain textures.
- Common Ground fixtures: 14 classes, 63 sessions, six coaches, two locations, six plans,
  eight events, six albums, three forms and 52 pages (a /password page among them, to preview
  the wall).
- Vendored Magic Spells components, the Archivo variable font and build wiring.
