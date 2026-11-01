# Restaurant

## 0.2.0

- The theme keeps `theme.json` and `design.json` in `settings/` and its templates and section
  groups in `data/`. The `home.cover` template is now `page.cover`, so the theme has one home
  template.
- Every section names a `kind` and a Lucide `icon`, so the Add-section picker groups it and
  draws its icon.
- The panel group is labelled Panel.
- A section whose color scheme defaulted to the first scheme now has no default and follows the
  site's base scheme; sections that default to another scheme keep it: the announcement bar and
  CTA band keep `tomato`, the footer and specials `charcoal`, the newsletter and testimonials
  `navy`, and value props `wine`.

## 0.1.0

- 32 sections: the global header, footer, announcement, mobile menu, booking sheet and cookie
  notice; the menu sections built on one dish card; home, content and form sections.
- Home, Home Cover, dish, menu, menu list, about, events, gallery, reservations, contact and
  page templates, and the 404, password and maintenance pages.
- Six colour schemes, six category tints and the Canteen type voice.
- Halfmoon Canteen fixtures: six categories, 36 dishes, four events, galleries and three forms.
- Vendored Magic Spells components, the Bricolage Grotesque font and build wiring.
