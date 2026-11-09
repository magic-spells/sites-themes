# Clinic

A theme for a practice: a dentist, a physio or chiropractor, a therapist or counsellor, or a vet.
It answers the four questions a new patient brings (what do you treat, who will I see, what does
it cost, how do I book) and puts one ask button on every screen: it opens an appointment request
(a sheet on a phone, a dialog from tablets) or links out to your online scheduler. Red Hat Display
carries the headings and Red Hat Text the rest, on seven quiet schemes from white to navy.

The fixtures are an invented practice, **Oakfield Family Dental**, with two offices (Oakfield and
Pine Ridge), so `sites dev` shows three categories, 13 services, eight concerns, six people, eight
insurers, two plans, two locations, twelve reviews, four posts and three forms instead of
placeholder text. The photographs are SVG placeholders; replace them before publishing.

```
settings/theme.json template roles, 3 section groups, Brand, Practice and Contact settings
settings/design.json every design token, the seven schemes (white, cloud, ice, sky, honey,
                    navy, slate) and the Calm and Plum palettes
layouts/default.pzl the <html> document: SEO, Open Graph, the reveal pre-paint script, skip link, slots
data/templates/     home, service, condition, member, location, post and page (+ about,
                    accessibility, advice, book, conditions, contact, fees, locations,
                    new-patients, reviews, services, team) as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           40, each with a full <schema>
components/         the shared shapes: Button, Routes, ProofRow, StatusDot, SectionHead, Well,
                    Glyph, IconCircle, ChooserTile, ServiceCard, ServiceRow, FeeRow, Price,
                    ClinicianCard, HoursCard, ReviewCard, RatingPill, PlanCard, Tile, Step,
                    ResourceRow, InsurerRow, Badge, Arrows, Questions, the form parts
styles/theme.css    the Tailwind entry: @theme maps the --sites-* tokens and Clinic's role sizes,
                    and the few rules utilities cannot express
scripts/theme.ts    the browser JavaScript: component registration, the appointment and menu
                    panels, a sent request reopening its sheet, the notice, the folding groups,
                    the ticker's pause button, scroll reveals
scripts/vendor/     the Magic Spells components, copied in (see vendor/VERSIONS.md)
styles/vendor/      the same components' stylesheets
assets/             Red Hat Display and Red Hat Text (OFL), the glyph sprite, the placeholders
locales/en.json     the strings the `t` function reads
sites.fixtures.json Oakfield Family Dental: pages, menus, forms and every content type
```

## Content

- **categories**: three to five groups (Preventive, Restorative, Cosmetic; Treatments and
  Classes; Dogs, Cats and Small pets), each with an icon, one line, a photo and a note.
- **services**: category, summary, description, duration, price and whether it is a starting
  price ("from"), a price note ("per tooth", "Most plans cover this in full"), what the visit
  includes (one per line), who provides it, an icon, a photo, featured, a tag and a position.
- **conditions**: the concerns a patient arrives with ("Tooth pain", "Lower back pain",
  "Anxiety"), each with a line, a body, the service that usually helps and who to see. Leave the
  type empty and its sections hide.
- **team**: role, letters (DDS, PT, DPT, LCSW), specialties (comma-separated), bio,
  credentials (one per line), location, a 4:5 portrait, featured and a position.
- **insurers**, **plans**, **locations** (with fax), **testimonials** (stars, date, source,
  "Seen by" a clinician, an optional square photo) and **posts** as their sections describe.

## Practice settings

Everything that changes from one practice to the next is a setting, so the same theme serves
four kinds of practice without a preset:

| | Dentist | Physio / chiro | Therapist | Vet |
|---|---|---|---|---|
| Ask button label | Book an appointment | Book an appointment | Book a free call | Book an appointment |
| Booking link | empty (the request) | your scheduler | empty, or a scheduler | your scheduler |
| New patients line | Accepting new patients | Accepting new patients | Taking new clients | Registering new pets |
| Insurance line | In-network with most major plans | Direct billing for most insurers | Out-of-network; superbills provided | empty |
| Emergency line | Tooth pain? Same-day slots. | empty | empty | Out of hours: … |
| Footer note | If this is a medical emergency, call 911. | empty | If you are in crisis, call or text 988. | empty |

A therapist removes the testimonials, fees and emergency band from Home in the editor; every
"patient" string a therapist would change is a setting or section text.

## Booking

Practice → Booking link decides what every ask button does. Empty: it opens the appointment
request, one site form (reason, clinician, new or returning, preferred days, time of day, name,
phone, email and a note with the caution line under it), and lands on the Book page
(`booking_path`) for a browser without JavaScript. Set: every ask button is a plain link to
your scheduler and the panel is not rendered. The request never asks for medical details.

## The Services tabs

The theme declares `query: ["category"]`, so the Services page's category tabs are plain
`?category=<handle>` links with `aria-current` on the one showing, and the footer and the
category columns link straight to a tab.

## Team groups

The team grid shows the featured people, everyone, or a group: the people whose role has (or
lacks) a word. The Team page shows "Dentists" (role has "dentist") and "Hygienists and team"
(role lacks it), so a large practice stays under twelve a band. A location narrows any of
them; on a location's page the grid narrows to that location by itself.

## Fonts

Red Hat Display (500, 600, 700) and Red Hat Text (400, 500, 600) ship self-hosted. The
alternate pairing is Fustat for the headings and Public Sans for the text; to use it, add the
two families' woff2 files under `assets/fonts/` and replace `settings/design.json`'s `fonts`
block:

```json
"fonts": {
  "heading": { "family": "Fustat", "weights": [500, 600, 700], "source": "self-hosted", "url": "/_sites/theme/fonts/fustat-latin-wght-normal.woff2" },
  "body": { "family": "Public Sans", "weights": [400, 500, 600], "source": "self-hosted", "url": "/_sites/theme/fonts/public-sans-latin-wght-normal.woff2" },
  "mono": { "family": "Public Sans", "weights": [400, 500, 600], "source": "self-hosted", "url": "/_sites/theme/fonts/public-sans-latin-wght-normal.woff2" }
}
```

## Palettes

**Clinic blue** (navy, action blue, mustard) is the default. **Calm** (petrol and sea-glass) and
**Plum** (aubergine and rose) recolour every scheme in one click: the navy, sky, honey and slate
bands, the links, the accent and the buttons reference the palette; the white page and its two
light greys stay as they are.
