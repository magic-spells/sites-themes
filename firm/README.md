# Firm

A theme for a professional practice: a law firm, an accounting practice, a consultancy or a
coach. This is its skeleton: the universal sections every Sites theme has, on placeholder
schemes and type, so it checks clean and renders every universal page. The palette, the type and
the firm's own sections come next.

The fixtures are a placeholder workspace, **Firm sample**: four pages (Home, About, Contact and
Privacy), three menus and two forms. The photographs are SVG placeholders at 4:5, 1:1, 4:3 and
3:2.

```
settings/theme.json the template roles, the three section groups, Brand and Contact settings
settings/design.json every design token and six placeholder schemes (paper, white, cream,
                    ink, deep-a, deep-b)
layouts/default.pzl the <html> document: SEO, Open Graph, the skip link, the slots
data/templates/     home, page, page.contact and page.privacy as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           announcement-bar, header, mobile-menu, cookie-notice, footer, page-header,
                    rich-text, image-with-text, newsletter, contact
components/         Button, Field, SectionHead, Well, Address, Glyph, Utility
styles/theme.css    the Tailwind entry: @theme maps the --sites-* tokens and Firm's role sizes,
                    and the few rules utilities cannot express
scripts/theme.ts    the browser JavaScript: component registration, the menu drawer, the
                    marquee's pause button, the notices, a sent form scrolled into view
scripts/vendor/     the Magic Spells components, copied in (see vendor/VERSIONS.md)
styles/vendor/      the same components' stylesheets
assets/             the favicon, the glyph sprite, the placeholders
locales/en.json     the strings the `t` function reads
sites.fixtures.json Firm sample: pages, menus, forms and the placeholder assets
```

## Colours and type

Every colour and every family lives in `settings/design.json`; `styles/theme.css` only maps the
`--sites-*` properties onto utilities, so a palette or type change is a value change there. The
scheme handles are also named in `styles/theme.css` (the seam between two bands on one scheme),
in the section schemas that start on a scheme other than the first (the announcement bar and the
footer on `ink`, the newsletter on `cream`) and in the stacks under `data/` that store one.

Links take the scheme's link colour, which is its text colour, with a 1px rule; a workspace that
wants an accent sets the scheme's link colour.

## Settings

**Brand**: the favicon, a logo shown in place of the name in the header, and the name set in the
heading face (empty uses the site name). **Contact**: the email, phone and address, printed in
the footer and beside the contact form. **Firm** is empty for now; the firm's own settings go
there.

The header's button label and link are the header section's own settings. The announcement bar
takes one notice per line; its close button hides it for that visitor until the text changes,
and so do the cookie notice's buttons.
