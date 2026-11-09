// Types for the vendored Tarot build. TypeScript 7 rejects one line of the
// bundle (a private static field read through `this.constructor`) that every
// browser runs, so the theme's type check reads this declaration in place of
// the JavaScript. The theme only registers the elements and talks to them
// through the DOM. Delete this file with
// the vendored copy once Tarot is installed from npm.
export declare class Tarot extends HTMLElement {}
export declare class TarotEffect {}
export default Tarot;
