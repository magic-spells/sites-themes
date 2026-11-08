# Portfolio

A theme for one person's site: an artist, illustrator, designer, photographer, writer or
developer. Visitors see the work, read who the person is and what they have done, and reach
them. One Home reads three ways: an art portfolio (the work index first, the hero short or
off), a resume (the name, a line and the CV) or a collection of work (projects grouped by
category, a page each). The work is large and square-cornered; the words are small and sit
below or above it, never on it. Mona Sans sets everything, on five schemes (paper, white,
stone, ink, cobalt), and the one accent colour marks text links, the active filter and the
status dot. A text link is underlined with a 1px rule; every button is outlined.

The fixtures are an invented designer and illustrator, **Juno Reyes** in Lisbon, so
`sites dev` shows four collections, twelve works with their galleries, twelve CV entries, six
posts and two forms instead of placeholder text. The pictures are SVG placeholders and the CV
is a one-page placeholder PDF; replace them before publishing.

```
settings/theme.json the template roles, 3 section groups, Brand, Person and Contact settings
settings/design.json every design token, the five schemes and the Gallery and Moss palettes
layouts/default.pzl the <html> document: SEO, Open Graph, the reveal pre-paint script, slots
data/templates/     home, work, post, page and 404 (+ about, contact, cv, work, writing)
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          password.pzl, maintenance.pzl
sections/           24, each with a full <schema>
components/         Arrows, Button, CollectionCard, Facts, Field, Filters, FormFields, Glyph,
                    Picture, PostCard, Row, SectionHead, Statement, Status, Tile
styles/theme.css    Tailwind with every token in @theme
scripts/theme.ts    the vendored components and the small behaviours they leave out
assets/             Mona Sans (OFL), glyphs.svg, the favicon, the placeholders, the CV PDF
```

## Content

- **categories**: description, order. The title is the name (Identity, Books, Drawings).
  Four to eight; the filter row and the collections list them in order.
- **works**: year, category (an entry in categories), details (one free line: "Oil on linen,
  120 × 90 cm"), role, client, summary, cover, cover_alt, gallery, body, link, featured, order.
  Details, role, client, gallery, body and link are optional; pages print only what is set.
  Page `/work/:work`.
- **cv_entries**: kind (experience, education, exhibition, award, press or talk), organisation,
  place, start (a year), end (a year, "Now" or empty), note, link, order. The title is the role,
  the degree, the show, the prize or the publication. Newest first by order.
- **posts** (optional): topic, date, author, standfirst, image, image_alt, body. Page
  `/writing/:post`.

## Settings

- **Brand**: the wordmark (your name, in the header, the footer and the name hero), the
  favicon, and Reveal on scroll (the name and the statements bloom in word by word; tiles,
  cards and CV rows fade up; off under reduced motion).
- **Person**: the role line and the location (the line above the name hero), Available for
  work (the status dot: the accent when on, muted when off), the availability line beside it,
  the email, the CV download and the contact form.
- **Contact**: the newsletter form. The social links are the `social` menu.

Menus: `main` (Work, CV, About, Writing, Contact), `legal` and `social`.

## Filtering by category

The work index's category filter is plain links, `/work?category=<handle>#work`, one per
category with All first; the theme declares `query: ["category"]` and the section shows the
works of that category only, up to twelve. Each collection card links to its category the
same way. There is no search and no server-side filter.

## The CV as a PDF

The theme cannot make a PDF. Upload your CV as a file, then set Person → CV download to its
address and a label ("Download CV"). The CV section and the picture hero show it as an
outlined button; with no link set, the button is not shown.
