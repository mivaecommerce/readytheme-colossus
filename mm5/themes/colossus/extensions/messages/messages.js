/**
 * 	Closable Messages
 */
(function ($) {
	'use strict';
	/*
	$.hook('message__close').each(function () {
		var ux_message_closer = $(this),
			ux_message = ux_message_closer.parent();

		ux_message_closer.on('click', function (e) {
			e.preventDefault();
			ux_message.fadeOut();
		});
	});
	*/
	var closeElements = document.querySelectorAll('[data-hook="message__close"]');

	Array.prototype.forEach.call(closeElements, function (element, index) {
		var ux_message_closer = element,
			ux_message = ux_message_closer.parentNode;

		ux_message_closer.addEventListener('click', function (event) {
			event.preventDefault();
			ux_message.classList.add('u-hidden');
		}, false);
	});
}(jQuery));



