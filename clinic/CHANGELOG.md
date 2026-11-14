# Clinic

## 0.2.0

- The panel group is labelled Panel.
- A section whose color scheme defaulted to the first scheme now has no default and follows the
  site's base scheme; sections that default to another scheme keep it: the announcement bar,
  badge row, concerns grid, fees, first visit, locations, newsletter, page header, plans and
  story keep `cloud`; the call bar, call to action and value props `navy`; the emergency band
  `sky`; and the footer `slate`.
- The starter templates, section groups and presets no longer store the first scheme, so a new
  site's sections follow its base scheme too. A stored `white` that overrides its section's own
  default (the story on About and Our team, the plans on Insurance and fees, the first visit on
  New patients) keeps its value, as does the white tile in the tiles' preset and on Home.

## 0.1.0

- 40 sections: the announcement bar (still or a ticker), the header (the wordmark, a Services
  panel grouped by category, one ask button and never the phone), the menu drawer, the
  appointment request (a bottom sheet on phones, a dialog from tablets), the call bar on phones,
  the cookie notice and the footer with the registration lines and the offices; the hero, value
  props, service categories, services grid and list, service detail, concerns grid and list,
  concern detail, team grid and member page, first visit, fees, insurance, plans, resources,
  emergency band, testimonials, tiles, badge row, story, FAQ, hours and location, locations,
  the CTA band, the appointment form, journal list, post, page header, rich text, image with
  text, newsletter and contact.
- Home, service, concern, member, location, post and page templates, with services, concerns,
  team, new patients, fees, reviews, locations, about, book, contact, advice and accessibility
  pages; the 404, password and maintenance pages.
- Six colour schemes (white, cloud, sky, honey, navy, slate) and three palettes (Clinic
  blue, Calm, Plum); Red Hat Display and Red Hat Text self-hosted; Lucide glyphs and service
  icons in one sprite.
- `?category=` tabs on the Services page, team groups by role, section heads left or centred,
  and Practice settings that fit a dentist, a physio, a therapist or a vet.
