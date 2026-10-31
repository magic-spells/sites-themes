# Company

A finished small-business site, not a skeleton. It is the starter to pick when the site is a
shop, a studio, a practice or a workshop: a home page that sells the place, a journal, a contact
page, and the chrome — announcement bar, sticky header, mobile menu, cookie notice, footer — that
every real site turns out to need on its second day.

The fixtures are an invented independent bookshop, **Marlow & Finch**, so `sites dev` shows a
site rather than a grid of lorem ipsum.

```
theme.json          template roles, 3 section groups, 6 settings in Brand information and Contact
design.json         every design token, 3 color schemes and 3 suggested palettes
layouts/default.pzl the <html> document: SEO and Open Graph from page.seo, the favicon, the skip link,
                    and the five layout slots
templates/          home.json, page.json (+ page.about/contact/privacy),
                    blog-list.json, post.json, password.pzl, 404.pzl, maintenance.pzl
groups/             header-group.json, footer-group.json, panel-group.json
sections/           17, every one with a full <schema>: settings, blocks and presets
components/         Button, Field, Chip
styles/theme.css    the Tailwind entry: @theme maps --sites-* into Tailwind's token names
scripts/theme.ts    the only browser JavaScript: the dialogs
tsconfig.json       turns the type check on: sites check runs tsc over scripts/
assets/             icons for {#svg} and placeholder artwork, served as-is
locales/en.json     the strings the `t` function reads
sites.fixtures.json Marlow & Finch: 9 pages, 3 menus, a gallery, 3 journal posts
```

## The build

`styles/theme.css` and `scripts/theme.ts` are compiled by Vite 8 with `@tailwindcss/vite` into
one stylesheet and one script, by `sites check`, by `sites dev` on every reload, and by the
compile-theme job in exactly the same way. Install the toolchain once:

```sh
npm install       # vite and @tailwindcss/vite
sites dev .       # http://127.0.0.1:3000
sites check .     # compiles the theme, type-checks scripts/, reports diagnostics
```

`assets/` is static files served as they are; it is not a second script pipeline. `dist/` is the
build's output and belongs in `.gitignore`, never in the repo.

## Styling

Every design token Sites owns reaches the markup as a Tailwind utility, because
`styles/theme.css` maps the `--sites-*` custom properties into Tailwind's own token names.
`bg-grey-extra-light`, `px-space-lg`, `text-4xl` and `rounded-lg` all resolve through a variable
at runtime, so changing a token in the admin restyles the site with no recompile.

Colors come in two flavours. The **palette** — `brand-*`, `grey-*` and the four utility pairs —
is the site's fixed set. The **scheme** properties (`bg-scheme-background`, `text-scheme-heading`,
`text-scheme-foreground`) follow the surface a section is rendered on: every section here carries
a `color_scheme` setting, the renderer stamps `sites-scheme-<name>` on its wrapper, and the same
markup recolors.

**The scheme properties are mapped with `@theme inline`, and that is not cosmetic.** A plain
`@theme` emits `--color-scheme-background: var(--sites-scheme-background)` at `:root`; CSS
substitutes the value there, once, and every section inherits the *default* scheme's color no
matter which class the renderer stamped on it. `@theme inline` puts the `var()` inside the
utility, so it resolves against the element. Three schemes ship: `default` (paper), `inverse`
(ink) and `accent` (terracotta).

Three rules follow, and this theme keeps all three:

- **No arbitrary values.** `p-[13px]` and `bg-[#070c16]` bypass the vocabulary. If a value is
  missing, add it to `design.json` first.
- **Custom classes are for what utilities cannot express.** One `@utility` (`sites-container`,
  the page gutter) and an `@layer components` layer holding `.sites-button` with its
  `-secondary` and `-quiet` modifiers, `.sites-input`, `.sites-label`, `.sites-chip` and
  `.sites-prose`. Everything else is a utility in the markup.
- **No `<style>` in a `.pzl` file** — Sites rejects one at compile time. CSS that utilities
  can't express lives in `styles/theme.css`: the dialog reset and animation, and the sticky
  header, a rule on the section wrapper the renderer writes
  (`[data-section="header"]:has([data-sticky])`), which no utility in the section's own markup
  can reach.

## Sections

| Group | Sections |
|---|---|
| page | `hero`, `features-grid`, `rich-text`, `image-with-text`, `gallery`, `testimonials`, `logo-cloud`, `faq`, `cta-band`, `contact`, `blog-list`, `newsletter` |
| `header-group` | `announcement-bar`, `header` |
| `footer-group` | `footer` |
| `panel-group` | `mobile-menu`, `cookie-notice` |

The `panel-group` holds the overlays. The layout renders it on every page, at
`<Slot name="panel-group"/>`, which is how the mobile menu and the notice reach every page.

## JavaScript

One file, about fifty lines, and it does exactly three things: open a `<dialog>` from
`[data-dialog-open="<id>"]`, close one from `[data-dialog-close]`, and show a
`[data-dialog-notice]` dialog once per visitor, remembering the dismissal in `localStorage`
under its `data-dialog-key`.

Everything else is markup and CSS. The header sticks with `position: sticky` on the section
wrapper (a rule in `styles/theme.css`), the FAQ is `<details>`, and the desktop menu's one level of children opens on hover and
on `:focus-within`. Nothing in the script adds or removes a class, because Tailwind only
generates what it can read in `.pzl` and `styles/` files — state lives on `data-` attributes.

## Accessibility

A skip link to `#content`; `header` / `main` / `footer` / `nav` / `address` landmarks, each
`nav` labelled; `aria-current="page"` on the active menu item; `:focus-visible` rings from the
`input.focus_ring` token; alt text taken from the asset, never invented in markup; a
`prefers-reduced-motion` block that flattens the dialog animation and turns off smooth scrolling;
and icons that are `aria-hidden` with a `sr-only` label beside them.

## Host contracts

- **`POST /_sites/unlock`** — `templates/password.pzl` posts `password` and `to` (the path the
  visitor asked for, from `request.query.return_to`) to the host's unlock endpoint, which
  redirects back to `to`. A wrong password or too many attempts re-renders the page with
  `request.query.password_error` set to the message to show.

The two forms — `contact` and `newsletter` — are site data, created alongside the site's
starter pages and menus. `sites.fixtures.json` supplies them for local development. A section's
`form` setting selects a site form, and `<Form>` supplies its action, honeypot and token.
`Field.pzl` renders the fields and restores their values and per-field errors. The form's button
label and success message come from site data; a successful submit returns to the same page.

## Engine gaps this theme ran into

- **`link.underline` is honoured by nothing**, here or in `minimal`: its value is a word
  (`always` / `hover` / `never`) and no CSS property takes one.
- **The `Maintenance` template cannot be seen in `sites dev`** — maintenance mode is not a path.
