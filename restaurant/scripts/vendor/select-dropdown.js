/**
 * select-dropdown component that handles the functionality of a custom dropdown
 * @class SelectDropdown
 * @extends HTMLElement
 */
class SelectDropdown extends HTMLElement {
	static #instanceCount = 0;

	// private fields for elements
	#instanceId;
	#trigger;
	#input;
	#optionsContainer;
	#currentFocusIndex = -1;
	#typeaheadBuffer = '';
	#typeaheadTimer = null;
	#defaultValue = null;
	#defaultValueCaptured = false;
	#originalLabelText = '';
	#pendingValue = null;
	#observer = null;
	#refreshScheduled = false;
	#outsideClickTimer = null;
	#ariaHiddenTimer = null;
	#optionIdSeq = 0;

	/**
	 * Attributes observed on the host element
	 * @returns {string[]}
	 */
	static get observedAttributes() {
		return ['value', 'disabled'];
	}

	/**
	 * Live getter for option elements — supports dynamically added/removed options
	 * @returns {NodeList}
	 * @private
	 */
	get #options() {
		return this.querySelectorAll('select-option');
	}

	/**
	 * Live getter for the trigger's label element — the trigger may be filled in
	 * after upgrade (framework wrappers), so never cache it
	 * @returns {HTMLElement | null}
	 * @private
	 */
	get #label() {
		return this.#trigger?.querySelector('.select-label-text') || null;
	}

	/**
	 * Whether an option is disabled
	 * @param {HTMLElement} option - the option element
	 * @returns {boolean}
	 * @private
	 */
	#isOptionDisabled(option) {
		return !!option && option.hasAttribute('disabled');
	}

	/**
	 * Finds the nearest enabled option index walking in one direction
	 * @param {HTMLElement[]} options - the full option list
	 * @param {number} from - index to start at (inclusive)
	 * @param {number} direction - 1 forward, -1 backward
	 * @returns {number} the index, or -1 when none is found
	 * @private
	 */
	#enabledIndex(options, from, direction) {
		for (let i = from; i >= 0 && i < options.length; i += direction) {
			if (!this.#isOptionDisabled(options[i])) return i;
		}
		return -1;
	}

	constructor() {
		super();
		const _ = this;
		_.#instanceId = ++SelectDropdown.#instanceCount;
		_.handlers = {};
	}

	get value() {
		const selectedOption = this.#getSelectedOption();
		if (selectedOption) return this.#getOptionValue(selectedOption);
		return this.#input?.value || '';
	}

	get selectedText() {
		const selectedOption = this.#getSelectedOption();
		if (selectedOption) return this.#getOptionText(selectedOption);
		return '';
	}

	set value(nextValue) {
		if (nextValue === null || nextValue === undefined) return;

		// remember the request even when the matching option does not exist yet —
		// it is re-applied as soon as options appear (see #refreshOptions)
		this.#pendingValue = String(nextValue);
		this.#resolvePendingValue();
	}

	/**
	 * Applies #pendingValue when its option exists. The request is kept so that
	 * late-arriving options — and a wholesale re-render of the option list —
	 * still resolve it. A user selection replaces it with the picked value, so
	 * a re-render can never revert a user's choice to an older request.
	 * @returns {boolean} true when the pending value was applied
	 * @private
	 */
	#resolvePendingValue() {
		if (this.#pendingValue === null) return false;

		const option = this.#findOptionByValue(this.#pendingValue);
		if (!option) return false;

		this.#applySelection(option);
		return true;
	}

	/**
	 * when element is connected to the dom
	 */
	connectedCallback() {
		const _ = this;

		_.queryDOM();
		_.setAttribute('tabindex', '-1');
		_.setupAriaAttributes();
		_.attachListeners();
		_.initializeSelectedOption();

		// an authored `value` attribute wins over the markup `selected` option
		if (_.hasAttribute('value')) _.value = _.getAttribute('value');
		else _.#resolvePendingValue();

		_.#applyDisabledState();
		_.#observeOptions();
		_.hide();
	}

	/**
	 * Routes observed attribute changes
	 * @param {string} name - attribute name
	 * @param {string | null} oldValue - previous value
	 * @param {string | null} newValue - next value
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		if (name === 'value') {
			if (newValue === null) return;
			this.value = newValue;
			return;
		}

		if (name === 'disabled') {
			this.#applyDisabledState();
		}
	}

	/**
	 * Mirrors the host `disabled` attribute onto the trigger
	 * @private
	 */
	#applyDisabledState() {
		const _ = this;
		const trigger = _.#trigger;
		if (!trigger) return;

		if (_.hasAttribute('disabled')) {
			trigger.setAttribute('tabindex', '-1');
			trigger.setAttribute('aria-disabled', 'true');
			_.hide({ restoreFocus: false });
			return;
		}

		trigger.setAttribute('tabindex', '0');
		trigger.removeAttribute('aria-disabled');
	}

	/**
	 * Watches the panel subtree so options added after upgrade get their aria
	 * wiring and any pending value is applied.
	 *
	 * When the panel does not exist yet — the host can connect before its
	 * children are parsed (a classic script in `<head>`, streamed HTML) or
	 * before a framework renders them — the HOST is watched instead, until the
	 * panel shows up. Only then is the narrow panel observer attached: writing
	 * the trigger label is itself a childList mutation inside the host, so
	 * watching the host is never a steady state.
	 * @private
	 */
	#observeOptions() {
		const _ = this;
		if (typeof MutationObserver === 'undefined') return;

		const bootstrapping = !_.#optionsContainer;

		_.#observer = new MutationObserver(() => {
			// coalesce a burst of mutations into one microtask
			if (_.#refreshScheduled) return;
			_.#refreshScheduled = true;
			Promise.resolve().then(() => {
				_.#refreshScheduled = false;
				if (!_.isConnected) return;

				if (bootstrapping) {
					// re-find the trigger / hidden input / panel as they arrive
					_.queryDOM();

					// mirror `disabled` onto a trigger that has only just landed
					_.#applyDisabledState();

					// no panel yet — keep waiting, and touch nothing that would
					// mutate the host subtree and retrigger this observer
					if (!_.#optionsContainer) return;

					// panel is here: swap to the panel observer BEFORE any work
					_.#observer.disconnect();
					_.#observer = null;
					_.#observeOptions();

					// the first capture ran against an empty host, so the markup
					// default and the placeholder label were never seen — redo it
					_.#defaultValueCaptured = false;
					_.initializeSelectedOption();
				}

				_.#refreshOptions();
			});
		});

		_.#observer.observe(bootstrapping ? _ : _.#optionsContainer, {
			childList: true,
			subtree: true,
		});
	}

	/**
	 * Re-runs the (idempotent) aria wiring and re-applies the selection
	 * @private
	 */
	#refreshOptions() {
		const _ = this;
		_.setupAriaAttributes();

		if (_.#resolvePendingValue()) return;
		if (_.#getSelectedOption()) {
			_.#syncSelectionOutputs();
			return;
		}

		// the selected option is gone from the new set and nothing resolves —
		// fall back to the placeholder rather than leaving a stale label behind.
		// No event: this is not a user selection.
		_.#applySelection(null);
	}

	/**
	 * Re-writes the hidden input and trigger label from the current selection
	 * without touching focus state
	 * @private
	 */
	#syncSelectionOutputs() {
		const option = this.#getSelectedOption();
		if (!option) return;

		if (this.#input) this.#input.value = this.#getOptionValue(option);
		if (this.#label) this.#label.textContent = this.#getOptionText(option);
	}

	/**
	 * Queries and caches all DOM elements needed for the component
	 * @private
	 */
	queryDOM() {
		const _ = this;

		_.#trigger = _.querySelector('select-trigger');
		_.#input = _.querySelector('input');
		_.#optionsContainer = _.querySelector('select-panel');
	}

	/**
	 * clean up event listeners when element is removed
	 */
	disconnectedCallback() {
		this.detachListeners();
		this.#observer?.disconnect();
		this.#observer = null;
		clearTimeout(this.#outsideClickTimer);
		this.#outsideClickTimer = null;
		clearTimeout(this.#ariaHiddenTimer);
		this.#ariaHiddenTimer = null;
	}

	/**
	 * Gets the value from an option element
	 * @param {HTMLElement} option - The option element
	 * @returns {string} The option value
	 * @private
	 */
	#getOptionValue(option) {
		if (option.hasAttribute('value')) return option.getAttribute('value');
		return option.textContent.trim();
	}

	/**
	 * Gets the label text from an option element
	 * @param {HTMLElement} option - The option element
	 * @returns {string} The option label
	 * @private
	 */
	#getOptionText(option) {
		return option.textContent.trim();
	}

	/**
	 * Finds the currently selected option
	 * @returns {HTMLElement | undefined}
	 * @private
	 */
	#getSelectedOption() {
		return Array.from(this.#options).find(
			(option) => option.getAttribute('aria-selected') === 'true'
		);
	}

	/**
	 * Finds an option matching the provided value
	 * @param {string} value - The option value to match
	 * @returns {HTMLElement | undefined}
	 * @private
	 */
	#findOptionByValue(value) {
		return Array.from(this.#options).find((option) => this.#getOptionValue(option) === value);
	}

	/**
	 * Applies selection state across the control
	 * @param {HTMLElement | null} option - The option to select
	 * @private
	 */
	#applySelection(option) {
		this.#options.forEach((opt) => {
			opt.removeAttribute('selected');
			opt.setAttribute('aria-selected', 'false');
		});

		if (!option) {
			if (this.#input) {
				this.#input.value = '';
			}

			if (this.#label) {
				this.#label.textContent = this.#originalLabelText;
			}

			this.#currentFocusIndex = -1;
			return;
		}

		option.setAttribute('aria-selected', 'true');
		option.setAttribute('selected', '');

		if (this.#input) {
			this.#input.value = this.#getOptionValue(option);
		}

		if (this.#label) {
			this.#label.textContent = this.#getOptionText(option);
		}

		this.#currentFocusIndex = Array.from(this.#options).indexOf(option);
	}

	/**
	 * Initializes any pre-selected options based on 'selected' attribute
	 * @private
	 */
	initializeSelectedOption() {
		const _ = this;

		const selectedOption = Array.from(_.#options).find((opt) => opt.hasAttribute('selected'));

		// Capture the default value and label on the first call
		if (!_.#defaultValueCaptured) {
			_.#defaultValue = selectedOption ? _.#getOptionValue(selectedOption) : null;
			_.#originalLabelText = _.#label ? _.#label.textContent : '';
			_.#defaultValueCaptured = true;
		}

		_.#applySelection(selectedOption || null);
	}

	/**
	 * Resets the component to its original default selection
	 * @private
	 */
	#resetToDefault() {
		const _ = this;
		const defaultOption =
			_.#defaultValue === null ? null : _.#findOptionByValue(_.#defaultValue) || null;

		_.#pendingValue = null;
		_.#applySelection(defaultOption);
	}

	/**
	 * sets up aria attributes for accessibility
	 */
	setupAriaAttributes() {
		const _ = this;
		const listbox = _.#optionsContainer;
		const trigger = _.#trigger;

		if (!trigger || !listbox) return;

		// setup trigger button
		trigger.setAttribute('aria-haspopup', 'listbox');
		trigger.setAttribute('aria-expanded', 'false');
		trigger.setAttribute('role', 'button');

		if (!trigger.id) {
			trigger.id = `select-trigger-${_.#instanceId}`;
		}

		// assign an ID to the listbox panel and link via aria-controls
		if (!listbox.id) {
			listbox.id = `select-panel-${_.#instanceId}`;
		}
		trigger.setAttribute('aria-controls', listbox.id);

		// setup listbox
		listbox.setAttribute('role', 'listbox');
		listbox.setAttribute('aria-labelledby', trigger.id);

		// setup options — idempotent so it can re-run when options change
		_.#options.forEach((option) => {
			option.setAttribute('role', 'option');

			if (option.getAttribute('aria-selected') !== 'true') {
				option.setAttribute('aria-selected', 'false');
			}

			if (!option.hasAttribute('tabindex')) {
				option.setAttribute('tabindex', '-1');
			}

			if (_.#isOptionDisabled(option)) option.setAttribute('aria-disabled', 'true');
			else option.removeAttribute('aria-disabled');

			// keep ids stable across re-runs so aria references never dangle
			if (!option.id) {
				option.id = `${trigger.id}-option-${_.#optionIdSeq++}`;
			}
		});
	}

	/**
	 * Attaches event listeners to the component
	 */
	attachListeners() {
		const _ = this;

		// bind event handlers
		_.handlers.documentClick = _.handleOutsideClick.bind(_);
		_.handlers.keyDown = _.handleKeyboardNavigation.bind(_);

		// listen for form reset to restore the original default selection
		const form = _.closest('form');
		if (form) {
			_.handlers.formReset = () => {
				requestAnimationFrame(() => {
					_.#resetToDefault();
				});
			};
			form.addEventListener('reset', _.handlers.formReset);
		}
	}

	/**
	 * Detaches event listeners from the component
	 */
	detachListeners() {
		document.removeEventListener('click', this.handlers.documentClick);
		document.removeEventListener('keydown', this.handlers.keyDown);

		// remove form reset listener
		if (this.handlers.formReset) {
			const form = this.closest('form');
			form?.removeEventListener('reset', this.handlers.formReset);
		}
	}

	/**
	 * handles click events outside of the dropdown to hide it
	 * @param {Event} e - the click event
	 */
	handleOutsideClick(e) {
		// if click is outside of the dropdown, hide it
		if (!this.contains(e.target)) {
			this.hide({ restoreFocus: false });
		}
	}

	/**
	 * handles keyboard navigation in the dropdown
	 * @param {KeyboardEvent} e - the keyboard event
	 */
	handleKeyboardNavigation(e) {
		const _ = this;
		const options = Array.from(_.#options);

		switch (e.key) {
			case 'Escape':
				e.preventDefault();
				_.hide();
				break;

			case 'ArrowDown': {
				e.preventDefault();

				// if focus is on trigger, start from selected option
				if (document.activeElement === _.#trigger) {
					const selectedIndex = options.findIndex(
						(opt) => opt.getAttribute('aria-selected') === 'true'
					);
					_.#currentFocusIndex = selectedIndex >= 0 ? selectedIndex : -1;
				}

				// move to the next ENABLED option
				const next = _.#enabledIndex(options, _.#currentFocusIndex + 1, 1);
				if (next >= 0) _.focusOption(next);
				break;
			}

			case 'ArrowUp': {
				e.preventDefault();

				// if focus is on trigger, start from selected option
				if (document.activeElement === _.#trigger) {
					const selectedIndex = options.findIndex(
						(opt) => opt.getAttribute('aria-selected') === 'true'
					);
					if (selectedIndex >= 0 && !_.#isOptionDisabled(options[selectedIndex])) {
						_.focusOption(selectedIndex);
						break;
					}
				}

				// move to the previous ENABLED option
				const prev = _.#enabledIndex(options, _.#currentFocusIndex - 1, -1);
				if (prev >= 0) {
					_.focusOption(prev);
				} else if (_.#currentFocusIndex >= 0) {
					// nothing enabled above — move focus back to the trigger
					_.#trigger?.focus();
					_.#currentFocusIndex = -1;
				}
				break;
			}

			case 'Home': {
				e.preventDefault();
				const first = _.#enabledIndex(options, 0, 1);
				if (first >= 0) _.focusOption(first);
				break;
			}

			case 'End': {
				e.preventDefault();
				const last = _.#enabledIndex(options, options.length - 1, -1);
				if (last >= 0) _.focusOption(last);
				break;
			}

			case 'Enter':
			case ' ':
				e.preventDefault();

				// if dropdown is hidden and trigger is focused, show it
				if (!_.hasAttribute('visible') && document.activeElement === _.#trigger) {
					_.show();
					return;
				}

				// if focus is on an option, select it
				if (_.#currentFocusIndex >= 0) {
					_.selectOption({ target: options[_.#currentFocusIndex] });
				} else if (document.activeElement === _.#trigger) {
					_.show();
				}
				break;

			case 'Tab':
				// Close without preventing default — let focus move naturally
				_.hide({ restoreFocus: false });
				break;

			default:
				// handle typeahead - accumulate keystrokes for multi-char matching
				const key = e.key.toLowerCase();

				if (key.length === 1) {
					_.#typeaheadBuffer += key;
					clearTimeout(_.#typeaheadTimer);
					_.#typeaheadTimer = setTimeout(() => {
						_.#typeaheadBuffer = '';
					}, 500);

					const allSameChar = _.#typeaheadBuffer.split('').every((c) => c === key);

					if (allSameChar) {
						// cycle through options starting with this letter
						const startIndex = _.#currentFocusIndex + 1;
						const len = options.length;
						for (let i = 0; i < len; i++) {
							const idx = (startIndex + i) % len;
							if (_.#isOptionDisabled(options[idx])) continue;
							if (options[idx].textContent.trim().toLowerCase().startsWith(key)) {
								_.focusOption(idx);
								break;
							}
						}
					} else {
						// multi-char prefix search from the beginning
						const match = options.findIndex(
							(opt) =>
								!_.#isOptionDisabled(opt) &&
								opt.textContent.trim().toLowerCase().startsWith(_.#typeaheadBuffer)
						);
						if (match >= 0) {
							_.focusOption(match);
						}
					}
				}
				break;
		}
	}

	/**
	 * focuses a specific option by index
	 * @param {number} index - the index of the option to focus
	 */
	focusOption(index) {
		const _ = this;
		const options = Array.from(_.#options);

		// reset tabindex on all options
		options.forEach((opt) => {
			opt.setAttribute('tabindex', '-1');
		});

		// set tabindex on target option and focus it — disabled options are skipped
		if (options[index] && !_.#isOptionDisabled(options[index])) {
			options[index].setAttribute('tabindex', '0');
			options[index].focus();
			_.#currentFocusIndex = index;

			// Ensure the option is visible in the dropdown
			options[index].scrollIntoView({
				block: 'nearest',
				behavior: 'instant',
			});
		}
	}

	/**
	 * selects an option from the dropdown
	 * @param {Event} e - the click event
	 */
	selectOption(e) {
		const _ = this;

		// a disabled control selects nothing
		if (_.hasAttribute('disabled')) return;

		const option = e.target.closest('select-option');
		if (!option) return;

		// disabled options are not selectable and do not close the panel
		if (_.#isOptionDisabled(option)) return;

		// skip if already selected (match native <select> behavior)
		const isAlreadySelected = option.getAttribute('aria-selected') === 'true';

		if (!isAlreadySelected) {
			// a user selection supersedes any programmatic request — and becomes
			// the standing one, so re-rendering the option list restores it
			// instead of dropping the selection or reverting to an older value
			_.#pendingValue = _.#getOptionValue(option);
			_.#applySelection(option);

			// bare `change`, matching native form controls
			_.dispatchEvent(new Event('change', { bubbles: true }));

			// value-carrying event — user selection only, never a programmatic set
			_.dispatchEvent(
				new CustomEvent('select-dropdown:change', {
					bubbles: true,
					detail: {
						value: _.#getOptionValue(option),
						label: _.#getOptionText(option),
					},
				})
			);
		}

		// hide the dropdown
		_.hide();
	}

	/**
	 * Positions the panel so the target option overlays the trigger
	 * @param {HTMLElement} targetOption - the option to align over the trigger
	 * @private
	 */
	#positionPanel(targetOption) {
		const _ = this;
		const panel = _.#optionsContainer;
		if (!panel) return;

		const viewportMargin = 8;

		// Clear previous positioning
		panel.style.top = '';
		panel.style.transformOrigin = '';
		panel.style.maxHeight = '';
		panel.scrollTop = 0;

		// Measure geometry
		const hostRect = _.getBoundingClientRect();
		const triggerRect = _.#trigger.getBoundingClientRect();
		const triggerOffset = triggerRect.top - hostRect.top;

		let idealTop = triggerOffset;

		if (targetOption) {
			// Shift panel up so target option aligns over the trigger
			idealTop = triggerOffset - targetOption.offsetTop;

			// Set transform-origin at the target option
			const originY = targetOption.offsetTop + targetOption.offsetHeight / 2;
			panel.style.transformOrigin = `center ${originY}px`;
		}

		// Max-height: from panel's top edge down to viewport bottom
		const panelScreenTop = hostRect.top + idealTop;
		const availableHeight = window.innerHeight - panelScreenTop - viewportMargin;

		// If panel would start above viewport, clamp top and scroll internally
		if (panelScreenTop < viewportMargin) {
			idealTop += viewportMargin - panelScreenTop;
			panel.style.maxHeight = `${window.innerHeight - viewportMargin * 2}px`;

			// Scroll so the target option aligns with the trigger's screen position
			if (targetOption) {
				const triggerScreenY = triggerRect.top - viewportMargin;
				panel.scrollTop = Math.max(0, targetOption.offsetTop - triggerScreenY);
			}
		} else {
			panel.style.maxHeight = `${Math.max(availableHeight, 120)}px`;
		}

		panel.style.top = `${idealTop}px`;
	}

	/**
	 * shows the dropdown options
	 */
	show() {
		const _ = this;

		// bail if already shown or disabled
		if (_.hasAttribute('visible') || _.hasAttribute('disabled')) return;

		// nothing to show yet — a host driven imperatively can be asked to open
		// before its trigger and panel exist
		if (!_.#optionsContainer || !_.#trigger) return;

		// set attributes for shown state
		_.setAttribute('visible', '');
		clearTimeout(_.#ariaHiddenTimer);
		_.#ariaHiddenTimer = null;
		_.#optionsContainer.setAttribute('aria-hidden', 'false');
		_.#trigger.setAttribute('aria-expanded', 'true');

		// reset typeahead buffer
		_.#typeaheadBuffer = '';

		// find selected option or default to first
		const options = Array.from(_.#options);
		const selectedOption = options.find(
			(opt) => opt.getAttribute('aria-selected') === 'true' && !_.#isOptionDisabled(opt)
		);
		const firstEnabledIndex = _.#enabledIndex(options, 0, 1);
		const targetOption = selectedOption || options[firstEnabledIndex] || null;

		// position the panel overlay
		_.#positionPanel(targetOption);

		// focus the target option (deferred to survive browser click focus)
		if (targetOption) {
			requestAnimationFrame(() => {
				if (!_.hasAttribute('visible')) return;
				_.focusOption(options.indexOf(targetOption));
			});
		}

		// add global event listeners. The outside-click listener waits for the
		// current event to finish: show() is often called FROM a click handler on
		// some element outside the trigger (a host framework flipping its own
		// `open` state), and that same click would otherwise bubble to document
		// and close the panel again.
		clearTimeout(_.#outsideClickTimer);
		_.#outsideClickTimer = setTimeout(() => {
			_.#outsideClickTimer = null;
			if (!_.hasAttribute('visible')) return;
			document.addEventListener('click', _.handlers.documentClick);
		}, 0);
		document.addEventListener('keydown', _.handlers.keyDown);

		// dispatch show event
		_.dispatchEvent(new CustomEvent('select-dropdown:show', { bubbles: true }));
	}

	/**
	 * hides the dropdown options
	 * @param {Object} [options] - hide options
	 * @param {boolean} [options.restoreFocus=true] - whether to return focus to the trigger
	 */
	hide({ restoreFocus = true } = {}) {
		const _ = this;
		const wasOpen = _.hasAttribute('visible');

		// reset typeahead buffer
		_.#typeaheadBuffer = '';
		clearTimeout(_.#typeaheadTimer);

		// set attributes for hidden state — inline positioning stays
		// so the panel animates out in place (cleared on next show)
		_.removeAttribute('visible');
		_.#trigger?.setAttribute('aria-expanded', 'false');

		// reset the current focus index
		_.#currentFocusIndex = -1;

		// remove global event listeners
		clearTimeout(_.#outsideClickTimer);
		_.#outsideClickTimer = null;
		document.removeEventListener('click', _.handlers.documentClick);
		document.removeEventListener('keydown', _.handlers.keyDown);

		// return focus to trigger only when closing an open panel
		if (wasOpen && restoreFocus) {
			_.#trigger?.focus();
		}

		// hide the panel from assistive tech only once focus has actually left it
		// — the browser blocks (and warns about) aria-hidden on an element whose
		// descendant still holds focus. On Tab, focus has not moved yet at keydown
		// time, so defer to the next task rather than blurring and breaking it.
		_.#applyPanelAriaHidden();

		// dispatch hide event
		if (wasOpen) {
			_.dispatchEvent(new CustomEvent('select-dropdown:hide', { bubbles: true }));
		}
	}

	/**
	 * Marks the panel aria-hidden, waiting a task when focus is still inside it
	 * @private
	 */
	#applyPanelAriaHidden() {
		const _ = this;
		const panel = _.#optionsContainer;
		if (!panel) return;

		clearTimeout(_.#ariaHiddenTimer);
		_.#ariaHiddenTimer = null;

		if (!panel.contains(document.activeElement)) {
			panel.setAttribute('aria-hidden', 'true');
			return;
		}

		_.#ariaHiddenTimer = setTimeout(() => {
			_.#ariaHiddenTimer = null;
			if (_.hasAttribute('visible')) return;
			panel.setAttribute('aria-hidden', 'true');
		}, 0);
	}
}

/**
 * select-trigger component
 * @class SelectTrigger
 * @extends HTMLElement
 */
class SelectTrigger extends HTMLElement {
	constructor() {
		super();
		const _ = this;
		_.handlers = {};
		_.handlers.keyDown = _.#onKeyDown.bind(_);
		_.handlers.click = _.#onClick.bind(_);
	}

	connectedCallback() {
		const _ = this;

		// Make the trigger focusable. Set here, not in the constructor: the host
		// upgrades first and may already have stamped tabindex="-1" for a
		// disabled control — a constructor write would clobber it.
		if (!_.hasAttribute('tabindex')) {
			const host = _.closest('select-dropdown');
			_.setAttribute('tabindex', host?.hasAttribute('disabled') ? '-1' : '0');
		}

		// Add the stock caret only when the author owns no chrome of their own.
		// Any element child other than `.select-label-text` (an svg, a custom
		// span, an already-present `.select-icon`) means hands off.
		if (_.#shouldInjectCaret()) {
			const caret = document.createElement('span');
			caret.className = 'select-icon';
			_.appendChild(caret);
		}

		_.attachListeners();
	}

	/**
	 * Whether the stock caret should be injected
	 * @returns {boolean}
	 * @private
	 */
	#shouldInjectCaret() {
		return !Array.from(this.children).some(
			(child) => !child.classList.contains('select-label-text')
		);
	}

	disconnectedCallback() {
		this.detachListeners();
	}

	/**
	 * Attaches event listeners to the trigger
	 */
	attachListeners() {
		const _ = this;
		_.addEventListener('keydown', _.handlers.keyDown);
		_.addEventListener('click', _.handlers.click);
	}

	/**
	 * Detaches event listeners from the trigger
	 */
	detachListeners() {
		const _ = this;
		_.removeEventListener('keydown', _.handlers.keyDown);
		_.removeEventListener('click', _.handlers.click);
	}

	/**
	 * Handle keydown events on the trigger
	 * @param {KeyboardEvent} e - The keyboard event
	 * @private
	 */
	#onKeyDown(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			e.stopPropagation();
			this.#toggleDropdown();
			return;
		}

		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const dropdown = this.closest('select-dropdown');
			if (dropdown && !dropdown.hasAttribute('visible')) {
				e.stopPropagation();
				this.#toggleDropdown();
			}
		}
	}

	/**
	 * Handle click events on the trigger
	 * @param {MouseEvent} e - The mouse event
	 * @private
	 */
	#onClick(e) {
		this.#toggleDropdown();
	}

	/**
	 * Toggle the parent dropdown
	 * @private
	 */
	#toggleDropdown() {
		const dropdown = this.closest('select-dropdown');
		if (!dropdown) return;
		if (dropdown.hasAttribute('visible')) {
			dropdown.hide();
		} else {
			dropdown.show();
		}
	}
}

/**
 * select-panel component
 * @class SelectPanel
 * @extends HTMLElement
 */
class SelectPanel extends HTMLElement {
	constructor() {
		super();
	}
}

/**
 * select-option component
 * @class SelectOption
 * @extends HTMLElement
 */
class SelectOption extends HTMLElement {
	constructor() {
		super();
		const _ = this;
		_.handlers = {};
		_.handlers.click = _.#onClick.bind(_);
	}

	connectedCallback() {
		this.attachListeners();
	}

	disconnectedCallback() {
		this.detachListeners();
	}

	/**
	 * Attaches event listeners to the option
	 */
	attachListeners() {
		this.addEventListener('click', this.handlers.click);
	}

	/**
	 * Detaches event listeners from the option
	 */
	detachListeners() {
		this.removeEventListener('click', this.handlers.click);
	}

	/**
	 * Handle click events on the option
	 * @param {MouseEvent} e - The mouse event
	 * @private
	 */
	#onClick(e) {
		e.preventDefault();
		this.#notifySelection();
	}

	/**
	 * Notify the parent dropdown that this option was selected
	 * @private
	 */
	#notifySelection() {
		const dropdown = this.closest('select-dropdown');
		if (dropdown && typeof dropdown.selectOption === 'function') {
			dropdown.selectOption({ target: this });
		}
	}
}

/**
 * select-divider component - visual separator between option groups
 * @class SelectDivider
 * @extends HTMLElement
 */
class SelectDivider extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		// Set here, not in the constructor: a custom element constructor may not
		// add attributes, and document.createElement() on a defined element
		// throws NotSupportedError if it does.
		if (!this.hasAttribute('role')) {
			this.setAttribute('role', 'separator');
		}
	}
}

/**
 * select-label component - non-interactive group heading within a select panel
 * @class SelectLabel
 * @extends HTMLElement
 */
class SelectLabel extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		// Set here, not in the constructor: a custom element constructor may not
		// add attributes, and document.createElement() on a defined element
		// throws NotSupportedError if it does.
		if (!this.hasAttribute('role')) {
			this.setAttribute('role', 'presentation');
		}
	}
}

/**
 * @file Main entry point for select-dropdown web component
 * @author Cory Schulz
 * @version 0.1.0
 */


// define custom elements if not already defined
if (!customElements.get('select-dropdown')) {
	customElements.define('select-dropdown', SelectDropdown);
}

if (!customElements.get('select-trigger')) {
	customElements.define('select-trigger', SelectTrigger);
}

if (!customElements.get('select-panel')) {
	customElements.define('select-panel', SelectPanel);
}

if (!customElements.get('select-option')) {
	customElements.define('select-option', SelectOption);
}

if (!customElements.get('select-divider')) {
	customElements.define('select-divider', SelectDivider);
}

if (!customElements.get('select-label')) {
	customElements.define('select-label', SelectLabel);
}

export { SelectDivider, SelectDropdown, SelectLabel, SelectOption, SelectPanel, SelectTrigger };
