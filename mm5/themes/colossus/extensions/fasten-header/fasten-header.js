/**
 +-+-+-+-+-+-+-+-+-+-+-+-+-+
 |f|a|s|t|e|n| |h|e|a|d|e|r|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * This extension is a more refined version of a classic "sticky" header function.
 */

function fastenHeader(position, siteHeader) {
	'use strict';

	var siteHeaderHeight = siteHeader.offsetHeight;

	if (position > siteHeaderHeight) {
		document.body.classList.add('x-fasten-header--is-active');
	}
	else {
		document.body.classList.remove('x-fasten-header--is-active');
	}
}

if ((sessionStorage.getItem('USER_CAN_HOVER') === null || sessionStorage.getItem('USER_CAN_HOVER') === 'true') && document.querySelector('[data-hook="fasten-header"]')) {
	var animationTimeout;
	var siteHeader = document.querySelector('[data-hook="site-header"]');

	fastenHeader(window.pageYOffset || document.documentElement.scrollTop, siteHeader);

	window.addEventListener('scroll', function () {
		'use strict';

		if (animationTimeout) {
			window.cancelAnimationFrame(animationTimeout);
		}

		animationTimeout = window.requestAnimationFrame(function () {
			fastenHeader(window.pageYOffset || document.documentElement.scrollTop, siteHeader);
		});
	}, false);
}
