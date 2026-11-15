# Academy

A theme for a school that teaches in classes and lessons: music and dance, languages, art,
tutoring, swimming. The site is the school's paperwork, typeset properly, so a parent can read
the week, the fees and the term dates on a phone without opening a PDF. The world is the
exercise book: coloured covers for the subjects, a white label on a cover or a photo, feint
rules under every row of the timetable, the class list, the fees and the dates, and dotted
leaders from a name to its price or time. Academy Serif carries the headings and Radio
Canada the rest, on eight schemes: feint, white, manila, light blue, ink, blue, burgundy and
brick. Academy Serif is Libre Baskerville cut to the latin characters and the weights 500 to
600, and renamed because the font's licence reserves its name for the original.

The fixtures are an invented school, **Larkfield Academy** in the Old Corn Exchange, so `sites dev`
shows five subjects, fourteen classes, twenty-two weekly sessions, twelve dates, eight teachers,
six testimonials, one building, six posts and three forms instead of placeholder text. The
photographs are SVG placeholders; replace them before publishing.

```
settings/theme.json template roles, 3 section groups, Brand, School and Contact settings
settings/design.json every design token and the eight schemes
layouts/default.pzl the <html> document: SEO, the reveal pre-paint script, skip link, slots
data/templates/     home, class, teacher, post and page (+ classes, timetable, dates,
                    teachers, fees, about, ask, contact, journal) as JSON
data/groups/        header-group.json, footer-group.json, panel-group.json
templates/          404.pzl, password.pzl, maintenance.pzl
sections/           32, each with a full <schema>
components/         the shared pieces: the cards and rows, the label, the leader, the form
styles/theme.css    Tailwind with every token in @theme
scripts/theme.ts    the vendored components and the small behaviours they leave out
assets/             Academy Serif and Radio Canada (OFL), glyphs.svg, the favicon, the placeholders
```

## Content

- **classes**: a short name for the timetable, the subject, ages and level as free text
  ("Ages 5–7", "Beginner"), a summary and description, the length, the price with
  `price_from` and a period printed after it ("£132 a term", "£165 for the week"), the teacher, a 3:2 photo,
  what to bring, featured. A page each at `/classes/<handle>`. The class list narrows to one
  subject with `?subject=<subject>`; the subjects come from the classes, so there is nothing
  else to enter. A subject's cover colour is its place among them in class order (blue, brick,
  burgundy, ink, light blue), so reordering classes changes it.
- A class never says when it runs. Its **sessions** (class, day, start, end, teacher, location
  and a note for the room) make the week; its **events** of kind `class` are dated runs; a class
  with neither is "By arrangement".
- **events**: every dated thing, with a date, an end date, a time and a kind: `term`, `closed`
  (half terms), `event` (open mornings, concerts, exams) or `class`. The dates list sorts them
  from the first; nothing says upcoming, so past dates are removed by hand.
- **coaches** (labelled Teachers), **testimonials**, **locations** and **posts**. The field
  ids a class, session, teacher or location shares with the other class themes mean the same
  here, so a workspace can switch and keep its data.
- Forms are the workspace's: `trial`, `contact` and `newsletter`. On a class page the ask form's
  class select starts on that class when one of its options reads the same as the class title.

## School settings

The ask label, `ask` (open the ask sheet, or follow `ask_url` to the school's own enrolment
page), the ask form, the confirm line under the ask, the
accreditation lines and what the school calls a subject.

## Develop

```
sites check ./academy
sites dev ./academy
```
