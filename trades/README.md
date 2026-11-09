# Trades

A theme for a home-services firm: a plumber, a heating engineer, an electrician, a roofer, a
landscaper or a general contractor. The site has two jobs, "call us" and "get a free estimate",
so both are on every screen: the ask button in the header, a call bar fixed to
the foot of a phone, and the estimate form a tap away in a sheet. Barlow Condensed carries the
headings in capitals and Instrument Sans the rest, on six schemes: paper, chalk, a brass band
for the specials, navy, charcoal and a muted rust.

The fixtures are an invented firm, **Hollis & Sons Plumbing and Heating** in Ashby, so
`sites dev` shows eight services, twelve projects, ten towns, four offers, two plans, five crew,
twelve reviews, one yard, four posts and four forms instead of placeholder text. The
photographs are SVG placeholders; replace them before publishing.

```
settings/theme.json template roles, 3 section groups, Brand, Yard and Contact settings
settings/design.json every design token, the six schemes and four palettes
layouts/default.pzl the <html> document: SEO, the reveal pre-paint script, skip link, slots
data/templates/     home, service, project, area, post and page (+ services, work, areas,
                    reviews, specials, about, estimate, contact, careers, journal) as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           38, each with a full <schema>
components/         the shared pieces: the proof row, the cards, the form
styles/theme.css    Tailwind with every token in @theme
scripts/theme.ts    the vendored components and the small behaviours they leave out
assets/             Barlow Condensed and Instrument Sans (OFL), glyphs.svg, the favicon, the placeholders
```

## Content

- **services**: summary, description, price with `price_from` ("from $3,200") and a price
  note, what's included one per line, an icon, a square photo, a tag ("Most booked"),
  featured. Each has a page at `/services/<handle>`. The ids match the other service themes,
  so a workspace can switch and keep its data.
- **projects**: past jobs with their service, town, date, a 3:2 photo, an optional before and
  after pair and a gallery. A page each at `/work/<handle>`; the work page filters them with
  `?service=<handle>` links.
- **areas**: the towns served. Each gets a page at `/areas/<handle>` from the area template,
  which shows the town's paragraph and map with the services and the jobs done there, so a
  firm with forty towns gets forty pages and writes one paragraph each.
- **offers** (coupons), **plans** (memberships), **team**, **testimonials** (stars, the town
  and job, the technician who came), **locations** and **posts**.
- Forms are the workspace's: `estimate`, `contact`, `newsletter` and `apply`. Fields are text,
  textarea, email, select and checkbox; a select shows as a select list with its own markup.

## Yard settings

The phone, an emergency number, the ask label, `ask` (open the estimate sheet, or
follow `ask_url`), the confirm line under every form, the estimate form, the rating with its
count, source and link, the year the firm started, the licence lines, the insured and
guarantee lines, the financing link and line, the service radius, and the call bar on phones.
Nothing is counted or dated by the theme: the since year and the © line are typed.

## Fonts and palettes

The default pairs Barlow Condensed (600, 700, 800) for headings with Instrument Sans for the
rest; Brand heading case sets the headings in capitals or as typed. For a softer look set the
heading font to Instrument Sans as well and heading case to sentence. A palette recolours
the bands' backgrounds and buttons through the brand colours, but not their hovers, tints,
borders or cards: Foundry (navy, the default), Van (charcoal and rust), Earth (forest and
ochre) and Brick (oxblood and gold). The accent text on light bands rides on
the warning colour.

## Develop

```
sites check ./trades
sites dev ./trades
```
