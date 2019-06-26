/**
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |o|v|e|r|l|a|y|N|a|v|i|g|a|t|i|o|n|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 *
 */

var overlayNavigation = (function (document) {
	'use strict';

	var navigationElement = document.querySelector('[data-hook="overlay-navigation"]');
	var openNavigationElement = document.querySelectorAll('[data-hook="open-overlay-navigation"]');
	var closeNavigationElement = document.querySelector('[data-hook="close-overlay-navigation"]');
	var publicMethods = {}; // Placeholder for public methods

	/**
	 * Toggle the visibility of the mini-basket
	 * @private
	 */
	var toggleMenu = function (event) {
		event.preventDefault();
		// Prevent window scrolling
		document.documentElement.classList.toggle('u-overflow-hidden');
		// Open the menu element
		navigationElement.classList.toggle('x-overlay-navigation--open');
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
	publicMethods.init = function () {
		// Open the overlay navigation when clicking any 'open' triggers
		openNavigationElement.forEach(function (openNavigation) {
			openNavigation.addEventListener('click', function (event) {
				toggleMenu(event);
			});
		});

		// Close the overlay navigation when clicking the 'close' trigger
		closeNavigationElement.addEventListener('click', function (event) {
			toggleMenu(event);
		});

		// Close the overlay navigation when clicking the background
		navigationElement.addEventListener('click', function (event) {
			if (event.target === this) {
				toggleMenu(event);
			}
		}, false);

		// Close the overlay navigation when the `Esc` key is pressed
		window.addEventListener('keydown', function (evt) {
			if (evt.defaultPrevented) {
				return; // Do nothing if the event was already processed
			}

			switch (evt.key) {
				case 'Escape':
					// Do something for "esc" key press.
					if (navigationElement.classList.contains('x-overlay-navigation--open')) {
						toggleMenu(evt);
					}
					break;
				default:
					return; // Quit when this doesn't handle the key event.
			}

			// Cancel the default action to avoid it being handled twice
			evt.preventDefault();
		}, true);
	};

	/**
	 * Public APIs
	 */
	return publicMethods.init();

}(document));
