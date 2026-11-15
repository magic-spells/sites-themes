# Nonprofit

A theme for a community charity: a food bank, a shelter, a youth club, a land trust or a
neighbourhood centre. The site has three jobs, "give", "help out" and "get help", so the ask
button sits in the header on every screen, the help link beside it, and the volunteer form is
one tap from any band. Parkinsans carries the headings and Atkinson Hyperlegible Next the rest,
on seven schemes: paper, chalk, oat, a clay band for the ask, moss, lake and night.

The fixtures are an invented charity, **Larkfield Community Kitchen**, so `sites dev` shows
programmes, events, posts, the team and three forms instead of placeholder text. The
photographs are SVG placeholders; replace them before publishing.

```
settings/theme.json template roles, 3 section groups, Brand, Organisation and Contact settings
settings/design.json every design token, the seven schemes and three palettes
layouts/default.pzl the <html> document: SEO, the reveal pre-paint script, skip link, slots
data/templates/     home, program, event, post and page (+ about, programs, get-involved,
                    donate, events, news, contact, get-help, accessibility, privacy) as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           each with a full <schema>
components/         the shared pieces: buttons, fields, the form, wells, rows, the carousel bar
styles/theme.css    Tailwind with every token in @theme
scripts/theme.ts    the vendored components and the small behaviours they leave out
assets/             Parkinsans and Atkinson Hyperlegible Next (OFL), glyphs.svg, the favicon,
                    the placeholders
```

## Content

- **programs**: what the charity runs, each with a page at `/programmes/<handle>`.
- **events**: dated, with a page at `/events/<handle>`.
- **posts**: stories, news and recipes, each at `/news/<handle>`, filtered by `?topic=` on the
  news page.
- **team**: staff and board, grouped by a select.
- Forms are the workspace's: `volunteer`, `contact` and `newsletter`. Fields are text,
  textarea, email, select and checkbox; a select shows as a select list with its own markup.

## Organisation settings

The give link (the donation platform's page), the ask label and an optional ask link that
overrides it, the help label and link, the legal line (one line each, for the © and the
registration number), the tax line under gifts, and the volunteer and newsletter forms.
Nothing is counted or dated by the theme: the © line is typed.

## Fonts and palettes

Parkinsans (500, 600) for headings and Atkinson Hyperlegible Next (400 to 600) for everything
else, both self-hosted. A palette recolours the bands through the brand and status colours:
Commons (ink, moss and clay, the default), Bluebell and Paper. Hairlines and hovers are mixed
from each scheme's text and ground, so they follow too.

Links are ink by default. To colour them on the light bands, set Brand accent to `#8A4B38`
(clay), which keeps 4.5:1 on paper, chalk and oat.

## Develop

```
sites check ./nonprofit
sites dev ./nonprofit
```
