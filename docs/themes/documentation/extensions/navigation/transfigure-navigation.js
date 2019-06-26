(function ($, window, document) {
	'use strict';

	/**
	 * Double Tap To Go [http://osvaldas.info/drop-down-navigation-responsive-and-touch-friendly]
	 * By: Osvaldas Valutis [http://www.osvaldas.info]
	 * License: MIT
	 */
	$.fn.doubleTapToGo = function () {
		if (!('ontouchstart' in window) && window.DocumentTouch && document instanceof DocumentTouch) {
			return false;
		}

		this.each(function () {
			var curItem = false;

			$(this).on('click', function (event) {
				var item = $(this);

				if (item[0] !== curItem[0]) {
					event.preventDefault();
					curItem = item;
				}
			});

			$(document).on('click touchstart MSPointerDown', function (event) {
				var resetItem = true,
					parents = $(event.target).parents();

				for (var i = 0; i < parents.length; i++) {
					if (parents[i] === curItem[0]) {
						resetItem = false;
					}
				}
				if (resetItem) {
					curItem = false;
				}
			});
		});
		return this;
	};


	/**
	 * This function works if the element, or its parent, have been hidden via JavaScript, and can either
	 * retrieve inner or outer dimensions as well as returning the offset values. The function is called
	 * directly on the object and will insert a clone just after the original element making it possible
	 * for the clone to maintain inherited dimensions.
	 *
	 * @param outer
	 * @returns {*}
	 *
	 * element width: $(ELEMENT).getRealDimensions().width;
	 * element outerWidth: $(ELEMENT).getRealDimensions(true).width;
	 * element height: $(ELEMENT).getRealDimensions().height;
	 * element outerHeight: $(ELEMENT).getRealDimensions(true).height;
	 * element offsetTop: $(ELEMENT).getRealDimensions().offsetTop;
	 * element offsetLeft: $(ELEMENT).getRealDimensions().offsetLeft;
	 */
	$.fn.getRealDimensions = function (outer) {
		var $this = $(this);

		if ($this.length === 0) {
			return false;
		}

		var $clone = $this.clone().css(
			{
				'display': 'block',
				'visibility': 'hidden'
			}
		).insertAfter($this);

		var result = {
			width: (outer) ? $clone.outerWidth() : $clone.innerWidth(),
			height: (outer) ? $clone.outerHeight() : $clone.innerHeight(),
			offsetTop: $clone.offset().top,
			offsetLeft: $clone.offset().left
		};

		$clone.remove();
		return result;
	};


	/**
	 * This function will check if navigation elements will be rendered outside
	 * of the visible area. If they will be, a class is added to the parent
	 * element which will change the render direction. You can pass a jQuery
	 * object as the `container` parameter to have the visible area set to
	 * something other than the documentElement.
	 *
	 * @param container
	 */
	$.fn.setOffsetDirection = function (container) {
		var triggerElement = $(this);

		triggerElement.on('mouseenter', function (e) {
			var parentElement = $(this),
				childElement = parentElement.find('ul').first(),
				grandchildElement = childElement.find('ul').first(),
				childOffsetWidth = childElement.offset().left + childElement.width(),
				documentWidth = container ? container.outerWidth() : document.documentElement.clientWidth;

			if (grandchildElement) {
				childOffsetWidth = childOffsetWidth + grandchildElement.getRealDimensions().width;
			}

			var isEntirelyVisible = (childOffsetWidth <= documentWidth);

			if (!isEntirelyVisible) {
				//console.log('NOT In the viewport!');
				parentElement.addClass('is-off-screen');
			}
			else {
				//console.log('In the viewport!');
				parentElement.removeClass('is-off-screen');
			}
		});
		return this;
	};


	/**
	 * This function is the compiled call for all the functions contained in this extension. You can pass a jQuery
	 * object as the `container` parameter to have the visible area set to something other than the documentElement.
	 *
	 * Example: $(ELEMENT).transfigureNavigation();
	 *          $(ELEMENT).transfigureNavigation($(CONTAINER_ELEMENT));
	 *
	 * @param container
	 */
	$.fn.transfigureNavigation = function (container) {
		var clientPort = document.documentElement.clientWidth;
		var waitForIt;

		window.addEventListener('resize', function (event) {
			if (!waitForIt) {
				waitForIt = setTimeout(function () {
					waitForIt = null;
					clientPort = document.documentElement.clientWidth;

					if (clientPort < 960) {
						showSubnavigation();
					}
				}, 66);
			}
		}, false);

		function showSubnavigation() {
			$.hook('has-child-menu').children('a').on('click', function (event) {
				var selected = $(this);

				event.preventDefault();
				selected.next('ul').removeClass('is-hidden');
				selected.parent('.has-child-menu').closest('ul').addClass('show-next');
			});

			$.hook('show-previous-menu').on('click', function (event) {
				var selected = $(this);

				event.preventDefault();
				selected.parent('ul').addClass('is-hidden').parent('.has-child-menu').closest('ul').removeClass('show-next');
			});
		}

		document.querySelector('[data-hook="open-main-menu"]').addEventListener('click', function (event) {
			event.preventDefault();
			document.documentElement.classList.add('has-open-main-menu');
			document.querySelector('[data-hook="transfigure-navigation"]').classList.add('is-open');
		});

		document.querySelector('[data-hook="close-main-menu"]').addEventListener('click', function (event) {
			event.preventDefault();
			document.documentElement.classList.remove('has-open-main-menu');
			document.querySelector('[data-hook="transfigure-navigation"]').classList.remove('is-open');
		});

		if (clientPort < 960) {
			showSubnavigation();
		}
		else {
			return this.doubleTapToGo().setOffsetDirection(container);
		}
	};
})(jQuery, window, document);
