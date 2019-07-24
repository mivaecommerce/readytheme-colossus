/**
 +-+-+-+-+-+-+-+-+
 |r|e|f|i|n|e|r|y|
 +-+-+-+-+-+-+-+-+
 *
 * This extension will display only the facets which will fit on the screen,
 * all others are hidden from view but can been seen via an off-canvas element.
 * Additionally, it will identify which facet sets have active selections and
 * display the active facets in a list below the main facet container. The
 * active facets can be clicked on to clear them as well as there being a
 * "Clear All" button.
 */

(function ($, window) {
	'use strict';

	let $facets = $.hook('refinery');
	let $refinerySetToggles = $.hook('refinery-set-toggle');
	let $triggerArea = $.hook('refinery__view-target');
	let $displayButton = $.hook('refinery__view-button');
	let $visibleLinks = $.hook('refinery__list');
	let $hiddenLinks = $.hook('refinery__overflow');
	let $annex = $.hook('refinery-annex');
	let numOfItems = 0;
	let totalSpace = 176;
	let breakWidths = [];
	let availableSpace;
	let numOfVisibleItems;
	let requiredSpace;
	let rangeSliders = document.querySelectorAll('[data-mm-facet-rangeslider-name]');
	let minDisplayWidth = 1040;
	let maxDisplay;
	let numOfVisibleItems2;

	/**
	 * Check the total space required for the facet sets and how many there are.
	 */
	if ($visibleLinks) {
		$visibleLinks.children().each(function () {
			totalSpace += $(this).outerWidth(true) + (parseInt($visibleLinks.css('padding-left')));
			numOfItems += 1;
			breakWidths.push(totalSpace);
		});
	}

	/**
	 * Compare the needed space with the available space and move breadcrumbs accordingly.
	 * @returns {jQuery}
	 */
	$.fn.checkFacetOverflow = function () {
		if ($facets) {
			if (window.innerWidth >= minDisplayWidth && window.innerWidth < 1173) {
				maxDisplay = 3;
			}
			else if (window.innerWidth >= 1173) {
				maxDisplay = 4;
			}
			else {
				maxDisplay = 2;
			}

			availableSpace = $visibleLinks.outerWidth(true) - parseInt($visibleLinks.css('padding-right'));
			numOfVisibleItems = $visibleLinks.children().length;
			requiredSpace = breakWidths[numOfVisibleItems - 1];
			numOfVisibleItems2 = $visibleLinks.children('[data-hook="refinery-set"]').length;

			if (numOfVisibleItems2 > maxDisplay) {
				// There is not enough space
				$visibleLinks.children('[data-hook="refinery-set"]').last().prependTo($hiddenLinks);
				numOfVisibleItems -= 1;
				$facets.addClass('is-loaded');
				this.checkFacetOverflow();
			}
			else if (numOfVisibleItems2 <= maxDisplay) {
				$facets.addClass('is-loaded');
				this.checkFacetOverflow();
			}

			// Update the button accordingly
			if ($hiddenLinks.children().length > 0) {
				$triggerArea.removeClass('u-hidden');
			}
			else {
				$triggerArea.addClass('u-hidden');
			}

			if (rangeSliders.length > 0) {
				MMFacet_RangeSlider_Initialize();
			}

			return this;
		}
	};


	/**
	 * Toggle the visibility of the refinery-annex
	 * @private
	 */
	let toggleAnnex = function (event) {
		event.preventDefault();
		// Prevent window scrolling
		$(document).toggleClass('u-overflow-hidden');
		// Open the annex element
		$annex.toggleClass('x-refinery-annex--open');
	};


	$.fn.refinery = function () {
		/**
		 * This allows for only one refinery set to be open at a time.
		 */
		$refinerySetToggles.on('change', function () {
			$refinerySetToggles.not(this).prop('checked', false);
		});

		/**
		 * This closes all refinery sets if you click outside of the refinery section.
		 */
		$(document).on('click', function (documentClick) {
			if (!$visibleLinks.is(documentClick.target) && $visibleLinks.has(documentClick.target).length === 0) {
				$refinerySetToggles.prop('checked', false);
			}
		});

		/**
		 * Check for resize and control button click.
		 */
		let initElement = this;
		let refineryTimeout;

		window.addEventListener('resize', function () {
			if (refineryTimeout) {
				window.cancelAnimationFrame(refineryTimeout);
			}

			refineryTimeout = window.requestAnimationFrame(function () {
				initElement.checkFacetOverflow();
				$.hook('open-refinery-annex').off('click');
				$.hook('close-refinery-annex').off('click');
				$annex.off('click');
			});
		}, false);

		// Element.matches() Polyfill
		if (!Element.prototype.matches) {
			Element.prototype.matches = Element.prototype.msMatchesSelector;
		}

		// Open the annex when clicking the trigger
		$.hook('open-refinery-annex').on('click', function (event) {
			$refinerySetToggles.prop('checked', false);
			toggleAnnex(event);
			if (typeof rangeSlidersAnnex !== 'undefined') {
				setTimeout(function () {
					MMFacet_RangeSlider_Initialize();
				}, 200);
			}
		});

		// Close the annex when clicking any 'close' triggers
		$.hook('close-refinery-annex').on('click', function (event) {
			toggleAnnex(event);
		});

		// Close the annex when clicking on the background.
		$annex.on('click', function (event) {
			if (event.target === this) {
				toggleAnnex(event);
			}
		});

		// Close the annex when the `Esc` key is pressed
		/*$(document).keydown(function (event) {
			let key = event.key || event.keyCode;

			if (key === 'Escape' || key === 27) {
				toggleAnnex(event);
			}
		});*/

		initElement.checkFacetOverflow();

	};

	/**
	 * Initialize the extension.
	 */
	if ($facets.length > 0 || $annex.length > 0) {
		$facets.refinery();


		/**
		 * This function will set the class of any filter set with an active selection to `is-active`.
		 * @type {NodeListOf<Element>}
		 */
		let filterSets = document.querySelectorAll('[data-hook="refinery-selections"]');

		for (let filterID = 0; filterID < filterSets.length; filterID++) {
			let filterSetActive = filterSets[filterID].querySelector('.is-selected');
			let filterSetSelect = filterSets[filterID].querySelector('select');
			let filterSetSelectActive;

			if (filterSetSelect) {
				filterSetSelectActive = filterSetSelect.selectedIndex;
			}

			if ((filterSetActive && !filterSetSelect) || (filterSetSelect && filterSetSelectActive >= 1)) {
				filterSets[filterID].previousElementSibling.classList.add('is-active');
			}
		}

		let selectedFilters = document.querySelector('[data-hook="selected-filters"]');

		/**
		 * This function will create trigger the clearing of the separate, selected filters.
		 * @type {Element}
		 */
		if (selectedFilters) {
			window.scrollTo(0, document.querySelector('[data-hook="refinery"]').getBoundingClientRect().top + window.scrollY);

			let filterTags = selectedFilters.querySelectorAll('[data-hook="filter-tag"]');

			for (let id = 0; id < filterTags.length; id++) {
				let filter = filterTags[id];

				filter.addEventListener('click', function (event) {
					event.preventDefault();

					let cancelledFilter = event.target;
					let filterCode = cancelledFilter.getAttribute('data-facet-code');
					let filterType = cancelledFilter.getAttribute('data-facet-type');

					if (filterType === 'checkbox' || filterType === 'radio') {
						let filterItem = document.querySelectorAll('input[type=' + filterType + '][name=' + filterCode + ']');

						for (let radios = 0; radios < filterItem.length; radios++) {
							if (filterItem[radios].checked === true) {
								filterItem[radios].checked = false;
								MMProdList_UpdateQuery(filterItem[radios]);
							}
						}
						return true;
					}
					else if (filterType === 'select') {
						let filterItem = document.querySelector('select[name=' + filterCode + ']');

						filterItem.value = '';
						MMProdList_UpdateQuery(filterItem);
						return true;
					}
					else if (filterType === 'rangeslider') {
						let filterItem = document.querySelector('input[name=' + filterCode + ']');

						filterItem.value = '';
						MMProdList_UpdateQuery(filterItem);
						return true;
					}

				});
			}
		}
	}

})(jQuery, window);
