/**
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |s|h|o|w| |d|o|n|t| |t|e|l|l|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * This extension will toggle the display state of a targeted element.
 */

var showDontTell = (function () {
	'use strict';

	var triggers = document.querySelectorAll('[data-hook="show-related"]');
	var publicAPIs = {};

	publicAPIs.init = function () {
		if (triggers.length > 0) {
			triggers.forEach(function (trigger) {
				var target = '[data-hook="' + trigger.getAttribute('data-target') + '"]';
				var relatedTarget = document.querySelector(target);
				var activeClass = trigger.getAttribute('data-active-class') ? trigger.getAttribute('data-active-class') : 'is-open';

				trigger.addEventListener('click', function (clickEvent) {
					clickEvent.preventDefault();
					trigger.classList.toggle('is-active');
					relatedTarget.classList.toggle(activeClass);
				}, false);

				document.addEventListener('mousedown', function (mouseEvent) {
					var eventTarget = mouseEvent.target;

					if (relatedTarget.classList.contains(activeClass)) {
						if (!relatedTarget.contains(eventTarget) && eventTarget !== trigger) {
							trigger.classList.toggle('is-active');
							relatedTarget.classList.toggle(activeClass);
							event.preventDefault();
						}
					}
				}, false);
			});
		}
	};

	return publicAPIs.init();
}());
