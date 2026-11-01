# Ledger

The News reference theme for Magic Spells Sites: The Daily Ledger, an invented local newsroom in a valley town. A condensed sans headline face over a plain body face, a strong 3px rule above every section, red kickers and three schemes (Paper, Ink, Slate).

## Sections

Masthead (sticky, with a scrolling topic strip), announcement bar, mobile menu, cookie notice and footer in the groups; lead story with a rail of the newest stories, editors' picks carousel, topic block, story grid, latest list, feature story, article, key facts, author card, page header, rich text, image with text, newsletter and contact. The 404, password and maintenance templates carry their own markup.

The `posts` contract keeps `topic`, `date`, `author`, `reading_minutes`, `standfirst`, `image`, `image_alt` and `body`; `image_credit`, `updated` and `key_facts` (one fact per line, `Label: value`) are optional. Dates are calendar dates only: no time of day, no "ago".

The story grid and topic block can offer a list/grid switch; the reader's choice is saved per browser. Cards and rows below the first screen reveal on scroll; the lead story and the first screen never wait, and reduced motion shows everything.

## Fixtures

Twenty-one stories across six topics by Priya Nand, Tom Reilly and a few named contributors, including five short briefs without images. There are no topic archives yet, so topic menus link to `/news#<topic>`.

## Carousel

Editors' picks use Tarot 0.1.0, vendored in `scripts/vendor/tarot.esm.js` and `styles/vendor/tarot.css` with `TAROT-LICENSE` alongside, until the npm release. `scripts/theme.ts` fits `slidesPerView` so every card is 18rem wide and the next one peeks on a phone. Below 48rem the track runs to the right edge of the screen while the rule row stays inside the gutter; arrows show from 48rem up.

TypeScript 7 rejects one line of the bundle (`_.constructor.#getPluginKey`, which runs fine), so `tsconfig.json` excludes the bundle and `scripts/vendor/tarot.esm.d.ts` declares its types.

## Run it

```sh
npm install
sites check .
sites dev . --addr 127.0.0.1:3961
```
