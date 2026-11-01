# Sites themes

The base themes for Magic Spells Sites, in one place to browse and copy. Each folder is a
complete theme: the same files a site's draft theme starts from.

| Theme | What it is |
|---|---|
| [`company/`](company/) | A finished small-business site: hero, features, gallery, testimonials, FAQ, contact and a journal, on three color schemes. |
| [`minimal/`](minimal/) | A clean single-column site with a header, footer, hero and rich text: the conventions with nothing to undo. |
| [`darkroom/`](darkroom/) | A photographer's portfolio on a near-black ground: series of photographs, carousels, grids and a lightbox, services, prints and packages, and a contact form. |

Each theme's own README explains its files, sections, styling and scripts.

## Start a theme from one

```sh
magic sites theme init company
```

`magic` is the Magic Spells CLI, which is still being built. Until it ships, copy a folder
with no install at all:

```sh
npx degit magic-spells/sites-themes/company my-theme
cd my-theme
npm install
```

## What a theme folder holds

```
theme.json           who the theme is: name, version, template roles, section groups, site settings
design.json          a default for every design token
package.json         the build's dependencies: vite and @tailwindcss/vite
layouts/             the <html> document and its five slots
templates/           page types: home or index, page, 404, maintenance, ...
groups/              header-group, footer-group and panel-group sections
sections/            the blocks an editor stacks on a page, each with a <schema>
components/          reusable tags
styles/theme.css     the Tailwind entry; maps the --sites-* tokens into @theme
scripts/             the browser script entry
assets/              images, fonts and SVGs, served as-is
locales/en.json      the strings the `t` function reads
sites.fixtures.json  sample content for local preview
README.md, LICENSE, CHANGELOG.md
```

The contract for that folder is the theme structure document in the Sites engine docs
(`theme-structure.md`, with `theme-repo.md` for the repo around it). When this README and that
document disagree, the document wins.

## Versions

The repo has one version: its tag. A tag `v0.1.0` publishes a GitHub release with
`sites-themes-v0.1.0.zip` (the whole tree, without `.git` and `.github`) and
`sites-themes-v0.1.0.sha256`. Sites pins one release by version and SHA-256, downloads that
zip when it builds, and embeds `company/` and `minimal/` as its starter themes. A change here
reaches new sites only when Sites moves its pin.

Each theme also keeps its own `version` in `theme.json` and its own `CHANGELOG.md`, for the
people who copy it. Those move when the theme changes; they are not a second release scheme.

A published zip never changes. A mistake is fixed with a new tag.

## Not yet

- **No `sites check` in CI here.** The Sites engine binary is not public yet; the `magic` CLI
  will publish it. Until then the themes are compiled and checked by Sites' own test suite after
  it fetches a release.
- **`fixtures/` and `screenshots/`** from the theme-repo layout are not read by Sites yet. Each
  theme ships one root `sites.fixtures.json`, which is what local preview reads.

## License

MIT. See [LICENSE](LICENSE).
