# Firm

A theme for a professional practice: a law firm, an accounting practice, a consultancy or a
coach. One call to action, the ask, runs through every page: a consultation form in a sheet that
rises from the foot of a phone and slides in from the right from 48rem.

The fixtures are **Thorne & Abara LLP**, a six-person estate planning, probate and
small-business practice in Portland, Oregon: seven practice areas, six people, six posts with
authors, four menus and the consultation and newsletter forms. `/specimen` shows the shared
elements together for review. The photographs are SVG placeholders at 3:4, 4:5, 16:10, 1:1 and
3:2, and a drawn map.

```
settings/theme.json the template roles, the three section groups, Brand, Contact and Firm settings
settings/design.json every design token and the nine schemes
layouts/default.pzl the <html> document: SEO, Open Graph, the skip link, the slots
data/templates/     the page stacks as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl, specimen.pzl
sections/           announcement-bar, header, mobile-menu, ask-panel, cookie-notice, footer,
                    page-header, rich-text, image-with-text, newsletter, contact
components/         Button (and the ask), Field, AskForm, SectionHead, PersonCard, PostCard,
                    Well, Address, Glyph, Utility
styles/theme.css    the Tailwind entry: @theme maps the --sites-* tokens and Firm's role sizes,
                    and the few rules utilities cannot express
scripts/theme.ts    the browser JavaScript: component registration, opening the sheets, the
                    notices, a sent form shown where it was
scripts/vendor/     the Magic Spells components, copied in (see vendor/VERSIONS.md)
styles/vendor/      the same components' stylesheets
assets/             the fonts and their licences, the favicon, the glyph sprite, the placeholders
locales/en.json     the strings the `t` function reads
sites.fixtures.json Thorne & Abara LLP: pages, content, menus, forms and the placeholder assets
```

## Colours and type

Nine schemes, navy and cream: paper (the ground), white, cream, gold, stone, graphite, navy,
brown and midnight. Every colour and every family lives in `settings/design.json`;
`styles/theme.css` only maps the `--sites-*` properties onto utilities. The engine has no muted,
rule, second-surface or accent slot, so muted text rides on the chip text, the rule on the chip
border, the second surface on the chip background and the accent on the icons slot. The accent
colours one phrase after a heading and the about band's half-disc; on the light schemes it is
the text colour. Links take the text colour with a 1px rule.

The scheme handles are also named in `styles/theme.css` (the seam between two bands on one
scheme), in the section schemas that start on a scheme other than the first, and in the stacks
under `data/`.

Headings are Libre Caslon Display, everything else Public Sans, both self-hosted with their OFL
licences beside them in `assets/fonts/`. Public Sans's italic is a second file, declared in
`styles/theme.css`.

## The ask

**Firm** settings: `ask_label` (the one call to action), `ask_url`, `ask_form`, `form_note` and
`legal_line`. A `Button` with no link is the ask: with `ask_url` set it links there (a
scheduler, say), otherwise it opens the ask panel. A section's button left without a link is the
ask too, labelled with `ask_label` when its own label is blank. On a practice area's page the
form's practice select starts on that practice. `form_note` sits above every submit button and
`legal_line` closes every page.

A form select with three options or fewer is a radio group; a longer one is a select list.

## Content

`services` (practice areas: summary, description, team as the lead, image, order), `team`
(people: role, letters, group professionals or staff, bio, credentials, image, email, order) and
`posts` (insights: topic, date, standfirst, image, body, team as the author). Their pages live
at `/practice-areas/:service`, `/people/:person` and `/insights/:post`.

The announcement bar takes one notice per line; its close button hides it for that visitor
until the text changes, and so do the cookie notice's buttons.
