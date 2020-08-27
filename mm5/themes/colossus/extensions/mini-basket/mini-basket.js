/**
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |m|i|n|i|B|a|s|k|e|t|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * This is an extension to use the mini-basket functionality of Miva in an
 * off-canvas method.
 */

var miniBasket = (function (document) {
	'use strict';

	var menuElement = document.querySelector('[data-hook="mini-basket"]');
	var openMenuElement = document.querySelectorAll('[data-hook="open-mini-basket"]');
	var closeMenuElements = document.querySelectorAll('[data-hook="close-mini-basket"]');
	var publicMethods = {}; // Placeholder for public methods
	var defaults = {
		closeOnBackgroundClick: true,
		closeOnEscClick: true
	};

	/**
	 * Merge two or more objects. Returns a new object.
	 * Set the first argument to `true` for a deep or recursive merge
	 * @private
	 * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
	 * @param {Object}   objects  The objects to merge together
	 * @returns {Object}          Merged values of defaults and options
	 */
	var extend = function () {

		// Variables
		var extended = {};
		var deep = false;
		var i = 0;
		var length = arguments.length;

		// Check if a deep merge
		if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
			deep = arguments[0];
			i++;
		}

		// Merge the object into the extended object
		var merge = function (obj) {
			for (var prop in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, prop)) {
					// If deep merge and property is an object, merge properties
					if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
						extended[prop] = extend(true, extended[prop], obj[prop]);
					}
					else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		// Loop through each object and conduct a merge
		for (; i < length; i++) {
			var obj = arguments[i];
			merge(obj);
		}

		return extended;

	};

	/**
	 * Toggle the visibility of the mini-basket
	 * @private
	 */
	var toggleMenu = function (event) {
		event.preventDefault();
		// Prevent window scrolling
		document.documentElement.classList.toggle('u-overflow-hidden');
		document.documentElement.classList.toggle('x-mini-basket-is-active');
		// Open the menu element
		menuElement.classList.toggle('x-mini-basket--open');
	};

	/**
	 * Toggle the visibility of the mini-basket
	 * @public
	 */
	publicMethods.toggle = function (event) {
		toggleMenu(event);
	};

	/**
	 * Initialize the plugin
	 * @public
	 */
	publicMethods.init = function (options) {
		// Merge user options with defaults
		var settings = extend(defaults, options || {});

		// Element.matches() Polyfill
		if (!Element.prototype.matches) {
			Element.prototype.matches = Element.prototype.msMatchesSelector;
		}

		// Open the mini-basket when clicking the trigger
		document.addEventListener('click', function (event) {
			if (event.target.matches('[data-hook~="open-mini-basket"]')) {
				toggleMenu(event);
			}
		});

		// Close the mini-basket when clicking any 'close' triggers
		document.addEventListener('click', function (event) {
			if (event.target.matches('[data-hook~="close-mini-basket"]')) {
				toggleMenu(event);
			}
		});

		// If enabled, close the mini-basket when clicking the background
		if (settings.closeOnBackgroundClick) {
			menuElement.addEventListener('click', function (event) {
				if (event.target === this) {
					toggleMenu(event);
				}
			}, false);
		}

		// If enabled, close the mini-basket when the `Esc` key is pressed
		if (settings.closeOnEscClick) {
			window.addEventListener('keydown', function (event) {
				if (event.defaultPrevented) {
					return; // Do nothing if the event was already processed
				}

				switch (event.key) {
					case 'Escape':
						// Do something for "esc" key press.
						if (menuElement.classList.contains('x-mini-basket--open')) {
							toggleMenu(event);
						}
						break;
					default:
						return; // Quit when this doesn't handle the key event.
				}

				// Cancel the default action to avoid it being handled twice
				event.preventDefault();
			}, true);
		}
	};

	/**
	 * Public APIs
	 */
	return publicMethods;

}(document));
