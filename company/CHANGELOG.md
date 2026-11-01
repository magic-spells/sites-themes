# Changelog

## 0.2.0

- The theme keeps `theme.json` and `design.json` in `settings/` and its templates and section
  groups in `data/`.
- Every section names a `kind` and a Lucide `icon`, so the Add-section picker groups it and
  draws its icon.
- The panel group is labelled Panel.
- A section whose color scheme defaulted to the first scheme now has no default and follows the
  site's base scheme; sections that default to another scheme keep it: the announcement bar and
  CTA band keep `accent`; the hero, newsletter, footer and cookie notice keep `inverse`.
- The page background is the base scheme's (`bg-scheme-background`), not white.
- The starter templates, section groups and presets no longer store the first scheme, so a new
  site's sections follow its base scheme too. A preset that picks the first scheme to override
  its section's own default (the announcement bar's Quiet, the hero's Plain) keeps its value.

## 0.1.0

- First release in sites-themes. The theme moved here unchanged from the Sites repository,
  where it was the embedded `company` starter.
