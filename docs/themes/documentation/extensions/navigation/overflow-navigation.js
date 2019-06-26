/**
 * This is a modified version of the GreedyNav script created by Luke Jackson.
 * https://github.com/lukejacksonn/GreedyNav
 * MIT License
 */

(function ($, window, document) {
	'use strict';

	var $overflowNavigation = $.hook('overflow-navigation'),
		$displayButton = $.hook('overflow-navigation__trigger'),
		$visibleLinks = $.hook('overflow-navigation__row'),
		$hiddenLinks = $.hook('overflow-navigation__group'),
		numOfItems = 0,
		totalSpace = 0,
		closingTime = 1000,
		breakWidths = [],
		availableSpace,
		numOfVisibleItems,
		requiredSpace,
		timer;

	$visibleLinks.children().each(function () {
		totalSpace += $(this).width(true);
		numOfItems += 1;
		breakWidths.push(totalSpace);
	});

	$.fn.checkNavigationOverflow = function () {
		// Get instant state
		availableSpace = $visibleLinks.width() - (parseFloat($visibleLinks.css('font-size')) * 2.5);
		numOfVisibleItems = $visibleLinks.children().length;
		requiredSpace = breakWidths[numOfVisibleItems - 1];

		// There is not enough space
		if (requiredSpace > availableSpace) {
			$visibleLinks.children().last().prependTo($hiddenLinks);
			numOfVisibleItems -= 1;
			$overflowNavigation.addClass('is-loaded');
			this.checkNavigationOverflow();
		}// There is more than enough space
		else if (availableSpace > breakWidths[numOfVisibleItems]) {
			$hiddenLinks.children().first().appendTo($visibleLinks);
			numOfVisibleItems += 1;
			$overflowNavigation.addClass('is-loaded');
			this.checkNavigationOverflow();
		}


		// Update the button accordingly
		if (numOfVisibleItems === numOfItems) {
			$displayButton.addClass('is-hidden');
		}
		else {
			if (numOfVisibleItems >= 1) {
				$displayButton.text('More');
			}
			else {
				$displayButton.text('Menu');
			}

			$displayButton.removeClass('is-hidden');
		}

		return this;
	};


	/**
	 * Double Tap To Go [http://osvaldas.info/drop-down-navigation-responsive-and-touch-friendly]
	 * By: Osvaldas Valutis [http://www.osvaldas.info]
	 * License: MIT
	 */
	$.fn.doubleTapToGo = function () {
		if ('ontouchstart' in window) {
			this.each(function () {
				var curItem = false;

				$(this).on('click', function (event) {
					var item = $(this);

					if (item[0] !== curItem[0]) {
						event.preventDefault();
						curItem = item;
					}
				});

				$(document).on('click', function (event) {
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
		}

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


	$.fn.overflowNavigation = function (container) {
		var initElement = this;
		var animationTimeout;

		window.addEventListener('resize', function (event) {
			if (animationTimeout) {
				window.cancelAnimationFrame(animationTimeout);
			}

			animationTimeout = window.requestAnimationFrame(function () {
				initElement.doubleTapToGo().setOffsetDirection(container).checkNavigationOverflow();
			});
		}, false);

		$displayButton.on('click', function () {
			$hiddenLinks.toggleClass('is-hidden');
			clearTimeout(timer);
		});

		$hiddenLinks.on('mouseleave', function () {
			// Mouse has left, start the timer
			timer = setTimeout(function () {
				$hiddenLinks.addClass('is-hidden');
			}, closingTime);
		}).on('mouseenter', function () {
			// Mouse is back, cancel the timer
			clearTimeout(timer);
		});

		// close when clicking somewhere else
		$('body').on('click', function (event) {
			if ($(event.target).closest($.hook('overflow-navigation')).length === 0) {
				$hiddenLinks.addClass('is-hidden');
			}
		});

		initElement.doubleTapToGo().setOffsetDirection(container).checkNavigationOverflow();
	};

})(jQuery, window, document);
