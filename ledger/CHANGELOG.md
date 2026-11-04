# Changelog

## 0.2.0

- The theme keeps `theme.json` and `design.json` in `settings/` and its templates and section
  groups in `data/`.
- Every section names a `kind` and a Lucide `icon`, so the Add-section picker groups it and
  draws its icon.
- The panel group is labelled Panel.
- A section whose color scheme defaulted to the first scheme now has no default and follows the
  site's base scheme; sections that default to another scheme keep it: the announcement bar,
  editor's picks and newsletter keep `ink`, and key facts and the latest list `slate`.
- The starter templates, section groups and presets no longer store the first scheme, so a new
  site's sections follow its base scheme too.

## 0.1.0

- Ledger, the News reference theme: nineteen sections, nine templates, three groups and the Paper, Ink and Slate schemes.
- Editor's picks carousel on Tarot 0.1.0 (vendored), with arrows, drag and a peeking next card on a phone.
- Story grid list/grid switch with the reader's choice saved; scroll reveals on cards and rows only.
- Twenty-one fixture stories, including five short briefs without images.
