# Minimal

The starter Sites writes when no template is named. It is the smallest theme
that is honest about the model rather than the smallest one that compiles: it
shows page templates, customizable sections, section groups, the full design
token vocabulary, two color schemes, and the three component classes a theme
owes its sections.

```
settings/theme.json template roles, section groups, three site settings
settings/design.json every design token and two color schemes
layouts/default.pzl the <html> document and its five slots: head-content and the header/footer/panel groups
data/templates/     home.json, page.json
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, maintenance.pzl
sections/           hero, rich-text, photo-gallery, form, header, footer
components/         Button, Field
styles/theme.css    the Tailwind entry: @theme maps --sites-* into Tailwind's token names
scripts/theme.js    the browser script; rename to theme.ts for TypeScript
package.json        the build's dependencies: vite and @tailwindcss/vite
locales/en.json     the strings the `t` function reads
sites.fixtures.json the data `sites dev` renders against
```

## Styling

Every design token Sites owns reaches the markup as a Tailwind utility, because
`styles/theme.css` maps the `--sites-*` custom properties into Tailwind's own
token names in `@theme`. `bg-grey-extra-light`, `px-space-lg`, `text-4xl`, and
`rounded-md` all resolve through a variable at runtime, so changing a token
value in the admin restyles the site with no recompile.

Colors come in two flavours. The **palette** — `brand-*`, `grey-*`, and the four
utility pairs — is the site's fixed set, and page chrome like the header and the
footer uses it directly. The **scheme** properties (`bg-scheme-background`,
`text-scheme-heading`, `text-scheme-foreground`) follow the surface a section is
rendered on: `hero` carries a `color_scheme` setting, the renderer stamps
`sites-scheme-<name>` on its wrapper, and the same markup recolors. The three
component classes read scheme colors for the same reason — a button inside an
inverse section inverts with it.

Three rules follow from that, and this theme keeps all three:

- No arbitrary values. `p-[13px]` and `bg-[#070c16]` bypass the vocabulary. If a
  value is missing, add it to `settings/design.json` first.
- Custom classes are for what utilities cannot express. `@layer components` here
  holds exactly three: `.sites-button` (with a `.sites-button-secondary`
  modifier), `.sites-input`, and `.sites-prose`. Sections use them rather than
  restyling a button or a form field for themselves. The Form section uses
  `.sites-input` for its fields and `.sites-button` for its submit button.
- No `<style>` in a `.pzl` file — Sites rejects one at compile time. CSS that
  utilities cannot express goes in `styles/theme.css`, the one stylesheet the
  site ships.

## Sections and groups

`hero`, `rich-text`, `photo-gallery`, and `form` are page sections: an editor
stacks them on a page, and each template's stack in `data/templates/` is where a
new page starts. `header` and `footer` are the same kind of file, placed instead
in the `header-group` and `footer-group` section groups (`data/groups/`), which
are site-level stacks rendered by the layout's named slots on every page —
including the not-found page.

The `panel-group` (labelled Panels) is declared and slotted but ships empty, so
a drawer or pop-up section added later appears without touching the layout.

## Forms

Add the Form section to a page and pick a site form in its settings. The seed
in `sites.fixtures.json` creates a simple Contact form with name, email, and
message fields. Forms belong to the site and are managed in the Forms panel;
`settings/theme.json` contains no form definitions.

The section writes its own fields inside `<Form handle={ settings.form }>`,
using `Field` for labels, required indicators, text inputs, textareas, selects,
checkboxes, restored values, and accessible field errors. Submit labels and
success messages come from the site form. If no form is selected or its handle
no longer exists, visitors see nothing and the preview shows a hint to pick or
create a form.

## The Maintenance template

The theme declares `templates/maintenance.pzl` through `maintenance_template`
in `settings/theme.json`. A maintenance request renders it with no page or page sections;
the site's section groups still render. `sites dev` does not trigger maintenance
mode. Like the not-found template, it is not selectable: neither appears in the
page picker.

## Running it

```sh
npm install          # vite and @tailwindcss/vite, so the theme builds
sites dev .          # serves sites.fixtures.json at http://127.0.0.1:3000
sites check .        # compiles the theme and reports diagnostics
```
