# Folio

A journal theme for one writer. The home page leads with the newest essay, the journal is an
index you read down, and a post is a single reading column with a drop cap and a standfirst.
Newsreader carries the words; IBM Plex Mono carries the datelines and labels.

The fixtures are an invented walking journal, **The Slow Mile**, so `sites dev` shows thirteen
essays, an about page and a contact form instead of placeholder text.

```
theme.json          template roles, 3 section groups, Brand, Journal, Writer and Contact settings
design.json         every design token, 4 color schemes and 3 suggested palettes
layouts/default.pzl the <html> document: SEO, Open Graph (article dates on posts), skip link, five slots
templates/          home.json, blog-list.json, post.json, page.json (+ page.about, page.contact),
                    404.pzl, password.pzl, maintenance.pzl
groups/             header-group.json, footer-group.json, panel-group.json
sections/           16, each with a full <schema>
components/         Button, Field, Chip, Dateline, PostDate, PostRow, PostCard
styles/theme.css    the Tailwind entry: @theme maps --sites-* tokens and Folio's role sizes
scripts/theme.ts    the browser JavaScript: mobile menu, sticky header, notice, announcement, reveals
scripts/vendor/     @magic-spells/dialog-panel 2.0.3, sticky-header 0.2.0 and reveal 0.1.1, copied from dist
styles/vendor/      the same three packages' stylesheets (reveal's Tailwind entry), copied from dist
assets/             Newsreader (OFL, see OFL-Newsreader.txt), icons and placeholder artwork
locales/en.json     the strings the `t` function reads
sites.fixtures.json The Slow Mile: pages, menus, forms and 13 posts
```

## Sections

Header, announcement bar, mobile menu, cookie notice and footer sit in the groups. The page
sections are featured post, post list (rows with a 3:2 thumbnail, or a grid of two or three
cards; by topic, with an offset to skip the newest, and an optional list/grid switch that
remembers the reader's choice), post article, author card, topics, pull quote, newsletter, contact, page header,
rich text and image with text.

## Scroll reveals

The Brand setting **Reveal cards on scroll** (`reveal_on_scroll`, on by default) fades post
cards and rows up as they come into view, a 50 ms stagger across each grid or list, along with
the author card, the newsletter and contact columns, image with text and the pull quote. The
header, announcement bar, page header, featured post, post body, footer, mobile menu and
cookie notice never move. It uses `@magic-spells/reveal`: 400 ms, once per element, and
whatever is on screen at first paint shows straight away. Reduced motion, JavaScript switched
off, or a script that fails to load all leave everything visible. Turned off, no reveal markup
is rendered and the library never starts.

## The posts content type

`topic`, `date`, `author`, `reading_minutes`, `standfirst`, `image`, `image_alt` and `body`,
with an optional `image_caption`. Dates always go through the `date` filter.

## Running it

```sh
npm install       # vite, @tailwindcss/vite, the two web components and reveal
sites dev .       # serves the fixtures
sites check .     # compiles the theme and type-checks scripts/
```

The two web components and reveal are vendored into `scripts/vendor/` and `styles/vendor/` because the
theme build resolves only the builder's own packages. To update one, bump the exact version in
`package.json`, `npm install`, and copy its `dist` files over the vendored ones.
