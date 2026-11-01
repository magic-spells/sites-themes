/*!
* Tarot Carousel v0.1.0 (beta)
* A highly customizable carousel with beautiful, physics-driven animations
* Copyright 2026 Magic Spells LLC
*
* Fair Source — public code, not open source (yet). Licensed under the
* Tarot Carousel License:
*   - Individual: free for one developer, client work included
*   - Team: required for teams of two or more developers (up to 25)
*   - Commercial: required per product that ships Tarot inside it
* Each release becomes MIT two years after publication.
*
* Author: Cory Schulz
* Website: https://www.magicspells.io/tarot
* Repo: https://github.com/magic-spells/tarot
* Licenses: https://www.magicspells.io/licenses
*/
//#region src/lazy-load.js
/**
* Promotes images on the current carousel page and its immediate neighbors.
* Current-page images load eagerly, while neighbor pages load at normal priority.
*/
var LazyLoad = class {
	static pluginName = "lazy-load";
	/**
	* @param {object} ctx - Shared carousel context
	*/
	constructor(ctx) {
		const _ = this;
		_.ctx = ctx;
		_.isInitialPass = true;
		_.handlers = {
			pageIndexChanged: () => _.promoteImages(),
			layoutChanged: () => _.promoteImages()
		};
		_.init();
	}
	/** Initialize image promotion and event listeners. */
	init() {
		const _ = this;
		_.bindEvents();
		_.promoteImages();
	}
	/** Bind store events used to reclassify pages. */
	bindEvents() {
		const _ = this;
		const { emitter, events } = _.ctx;
		emitter.on(events.store.pageIndexChanged, _.handlers.pageIndexChanged);
		emitter.on(events.store.layoutChanged, _.handlers.layoutChanged);
	}
	/** Promote images belonging to the current and neighboring pages. */
	promoteImages() {
		const _ = this;
		const slides = _.ctx.store.getSlides();
		const state = _.ctx.store.getState();
		const options = _.ctx.store.getOptions();
		const slidesPerMove = Math.max(1, Number(options.slidesPerMove) || 1);
		const slidesPerView = Math.max(1, Math.ceil(Number(options.slidesPerView) || 1));
		const slideCount = Math.min(slides.length, Math.max(0, state.slideCount || slides.length));
		const pageCount = Math.max(0, state.pageCount || 0);
		if (!slideCount || !pageCount) return;
		const canLoop = state.canLoop && options.loop;
		const centered = options.align === "center";
		const currentPage = Math.max(0, Math.min(state.pageIndex || 0, pageCount - 1));
		const neighborPages = /* @__PURE__ */ new Set();
		for (const offset of [-1, 1]) {
			let page = currentPage + offset;
			if (canLoop) page = (page % pageCount + pageCount) % pageCount;
			if (page >= 0 && page < pageCount) neighborPages.add(page);
		}
		const currentSlides = _.getSlidesForPage(currentPage, slideCount, slidesPerMove, slidesPerView, canLoop, centered);
		const neighborSlides = /* @__PURE__ */ new Set();
		for (const page of neighborPages) for (const index of _.getSlidesForPage(page, slideCount, slidesPerMove, slidesPerView, canLoop, centered)) neighborSlides.add(index);
		const candidates = [.../* @__PURE__ */ new Set([...currentSlides, ...neighborSlides])].sort((a, b) => a - b);
		for (const i of candidates) {
			const isCurrent = currentSlides.has(i);
			const images = slides[i].querySelectorAll("img");
			for (const image of images) {
				_.promoteImage(image);
				if (isCurrent) {
					image.setAttribute("loading", "eager");
					if (_.isInitialPass) image.setAttribute("fetchpriority", "high");
				} else if (image.getAttribute("loading") === "lazy") image.removeAttribute("loading");
			}
		}
		_.isInitialPass = false;
	}
	/**
	* Get the slide indices visible on a page.
	* Pages anchor at slideIndex = page * slidesPerMove (see layout-metrics /
	* track-math): start-aligned normally, viewport-centered with
	* align: 'center' — where the visible window extends both directions
	* from the anchor and gets boundary-clamped when not looping.
	* @param {number} page - Page index
	* @param {number} slideCount - Total slide count
	* @param {number} slidesPerMove - Slides advanced per page
	* @param {number} slidesPerView - Slides visible per page
	* @param {boolean} canLoop - Whether indices wrap
	* @param {boolean} centered - Whether the anchor slide is viewport-centered
	* @returns {Set<number>} Slide indices on the page
	*/
	getSlidesForPage(page, slideCount, slidesPerMove, slidesPerView, canLoop, centered) {
		const indices = /* @__PURE__ */ new Set();
		const anchor = page * slidesPerMove;
		let start = centered ? anchor - Math.ceil((slidesPerView - 1) / 2) : anchor;
		if (!canLoop) start = Math.min(Math.max(0, start), Math.max(0, slideCount - slidesPerView));
		for (let offset = 0; offset < slidesPerView && offset < slideCount; offset++) {
			const index = canLoop ? ((start + offset) % slideCount + slideCount) % slideCount : start + offset;
			if (index >= 0 && index < slideCount) indices.add(index);
		}
		return indices;
	}
	/**
	* Swap deferred image source attributes into their active counterparts.
	* @param {HTMLImageElement} image - Image to promote
	*/
	promoteImage(image) {
		if (image.hasAttribute("data-src")) {
			image.setAttribute("src", image.getAttribute("data-src"));
			image.removeAttribute("data-src");
		}
		if (image.hasAttribute("data-srcset")) {
			image.setAttribute("srcset", image.getAttribute("data-srcset"));
			image.removeAttribute("data-srcset");
		}
	}
	/** Remove all plugin listeners. */
	destroy() {
		const _ = this;
		const { emitter, events } = _.ctx;
		emitter.off(events.store.pageIndexChanged, _.handlers.pageIndexChanged);
		emitter.off(events.store.layoutChanged, _.handlers.layoutChanged);
	}
};
if (typeof window !== "undefined") (window.TarotPluginQueue = window.TarotPluginQueue || []).push({
	pluginName: "lazy-load",
	plugin: LazyLoad
});
//#endregion
export { LazyLoad as default };

//# sourceMappingURL=lazy-load.esm.js.map