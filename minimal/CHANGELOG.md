# Changelog

## 0.2.0

- The theme keeps `theme.json` and `design.json` in `settings/` and its templates and section
  groups in `data/`, and the `index` template is now `home`.
- Every section names a `kind` and a Lucide `icon`, so the Add-section picker groups it and
  draws its icon.
- The panel group is labelled Panel.
- A section whose color scheme defaulted to the first scheme now has no default and follows the
  site's base scheme; sections that default to another scheme keep it: the footer keeps
  `inverse`.
- The page background is the base scheme's (`bg-scheme-background`), not white.

## 0.1.0

- First release in sites-themes. The theme moved here unchanged from the Sites repository,
  where it was the embedded `minimal` starter.
