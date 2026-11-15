# Community

A theme for a community house, a village hall, a church hall or a neighbourhood centre: the
place where the same groups meet every week and anyone can walk in. It answers what a
neighbour asks first (what is on, when, where, is it for me, how do I get there) with the week
on one sheet, a noticeboard of what is coming up, the groups as plain rows and the door plate
with the hours and the address, and leaves the pictures to the photo wall. Averia Serif Libre
sets the headings and Radio Canada the rest, on six schemes from paper to umber.

The fixtures are an invented house, **Larch Street Community House**, so `sites dev` shows twelve
groups, eight events, eight people, six albums, six posts and three rooms instead of placeholder
text. The photographs are SVG placeholders; replace them before publishing.

```
settings/theme.json template roles, 3 section groups, Brand, House and Contact settings
settings/design.json every design token and the six schemes (paper, mist, cream, blue, moss,
                    umber)
layouts/default.pzl the <html> document: SEO, Open Graph, the reveal pre-paint script, skip link, slots
data/templates/     home, group, event, album, post and page (+ about, contact, groups, hire,
                    news, photos, privacy, visit, whats-on) as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           30, each with a full <schema>
components/         Button, SectionHead, Rise, Well, Glyph, Utility; PersonCard,
                    PersonLine, GroupRow, EventRow, Slip, Print, When; Hours, Address, Plate;
                    Chips, Questions, LightboxCompanion and the form parts (Field, FormFields)
styles/theme.css    the Tailwind entry: @theme maps the --sites-* tokens and Community's role
                    sizes, and the few rules utilities cannot express
scripts/theme.ts    the browser JavaScript: component registration, the menu drawer, the
                    notice and announcement, the ticker's pause button, the lightbox, reveals
scripts/vendor/     the Magic Spells components, copied in (see vendor/VERSIONS.md)
styles/vendor/      the same components' stylesheets
assets/             Averia Serif Libre and Radio Canada (OFL), the glyph sprite, the placeholders
locales/en.json     the strings the `t` function reads
sites.fixtures.json Larch Street Community House: pages, menus, forms and every content type
```

## Content

- **groups**: the regular week. A summary, a description, a 1:1 photo, the days ("tue, thu"),
  start and end as two-digit 24-hour times ("09:30": the week sorts by them), how often in
  words (blank is every week: "1st Wednesday", "Term time"), where (blank is the house), the
  host, a link, a kind for the filter, featured and a position. A group that meets at two
  different times is two entries.
- **events**: dated one-offs only. The date, the time in words, the place, one line, a
  description, a 3:2 photo, a link, the album from last time and the group it belongs to.
- **albums** (the first photo is the cover), **people** (role, a 4:5 portrait, the team: staff,
  committee or volunteers) and **posts** (news and newsletter issues, by topic) as their sections
  describe.

## House settings

The hours, the address, the access line and the map are set once and read everywhere: the
header's one ask, the door plate on Visit and Contact, the drawer and the footer. Opening hours
take one line per day or range with the time last: `Monday to Friday 9:00–16:00`, `Sunday
Closed`. Nothing reads a clock, so no day is ever marked open or closed.

## Filters

The theme declares `query: ["kind", "topic"]`: the groups' kinds and the posts' topics are plain
`?kind=` and `?topic=` links with `aria-current` on the one showing.

## Palette

**Stencil**: municipal blue, moss and umber on warm paper.
