/**
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |o|m|e|g|a| |n|a|v|i|g|a|t|i|o|n|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * This is a mega-menu navigation extension.
 */

const omegaman = (function ($, window, document) {
	'use strict';

	let omegaTimeout;
	let omegaActivator = document.querySelector('[data-hook~="activate-omega"]');
	let fastenHeader = document.querySelector('[data-hook="fasten-header"]');
	let fastenHeaderActivator = document.querySelector('[data-hook~="open-omega"]');
	let omegaNavigation = document.querySelector('[data-hook="omega-navigation"]');
	let omegaContent = document.querySelector('[data-hook="omega-navigation__content"]');
	let parentLinks = document.querySelectorAll('[data-hook~="omega-navigation__link"]');
	let childrenLinks = document.querySelector('[data-hook~="omega-navigation__children"]');
	let childrenBlocks = childrenLinks.children;
	let activeParent;
	let activeTarget;
	let mobileActivator = document.querySelector('[data-hook~="open-main-menu"]');
	let mobileCloser = document.querySelector('[data-hook~="close-main-menu"]');
	let currentItem = false;


	/**
	 * This function calculates the width of the scrollbar.
	 */
	function getScrollbarWidth() {
		return window.innerWidth - document.documentElement.clientWidth;
	}

	/**
	 * This function finds the first parent link and triggers a `click` event.
	 */
	function setInitial() {
		parentLinks.forEach(function (parent, index) {
			let target = '[data-hook~="' + parent.getAttribute('data-children') + '"]';
			let targetChild = document.querySelector(target);

			currentItem = false;
			if (index === 0 && targetChild !== null) {
				parent.dispatchEvent(new Event('mouseenter'));
			}
		});
	}

	function smallerScreenFunctionality() {
		$.hook('omega-child-menu').children('a').on('click', function (event) {
			let selected = $(this);

			event.preventDefault();
			selected.next('ul').removeClass('is-hidden');
			selected.parent('.has-child-menu').closest('ul').addClass('show-next');
		});

		$.hook('show-previous-menu').on('click', function (event) {
			let selected = $(this);

			event.preventDefault();
			selected.parent('ul').addClass('is-hidden').parent('.has-child-menu').closest('ul').removeClass('show-next');
		});
	}

	function largerScreenFunctionality() {
		/**
		 * Update the height of the child navigation container to accommodate a scrollbar if needed.
		 */
		//omegaContent.style.height = omegaContent.scrollHeight + getScrollbarWidth() + 'px';

		function displayTargetNavigation(element, event) {
			let target = '[data-hook~="' + element.getAttribute('data-children') + '"]';
			let targetChild = document.querySelector(target);

			if (targetChild === null) {
				return
			}

			event.preventDefault();

			parentLinks.forEach(function (sibling) {
				sibling.classList.remove('is-active');
			});

			Array.from(childrenBlocks).forEach(function (childBlock) {
				childBlock.classList.remove('is-active');
			});

			activeParent = element;
			activeTarget = targetChild;
			element.classList.add('is-active');
			targetChild.classList.add('is-active');
		}

		function closeTargetedNavigation() {
			activeParent.classList.remove('is-active');
			activeTarget.classList.remove('is-active');
		}

		/**
		 * When clicking on a parent category, show its children adn grandchildren.
		 */
		parentLinks.forEach(function (parentLink) {
			parentLink.addEventListener('mouseenter', function (event) {
				displayTargetNavigation(this, event);
			});

			parentLink.addEventListener('mouseleave', function (event) {
				//closeTargetedNavigation();
			});
		});

		/**
		 * This following section is for use on larger, touch-enabled devices so the first
		 * 'tap' on a parent category link will act like a 'hover'. If a user taps again on
		 * the link, before clicking on a different parent category link, they will be
		 * directed to the content referenced in the links `href`.
		 */

		if ('ontouchstart' in window) {
			for (let i = 0; i < parentLinks.length; i++) {
				parentLinks[i].setAttribute('data-index', i);
				parentLinks[i].addEventListener('click', function (event) {
					let item = this;
					let index = item.getAttribute('data-index');

					if (index !== currentItem) {
						event.preventDefault();
						currentItem = index;
						//displayTargetNavigation(item, event);
					}
				});

			}
		}
	}

	/**
	 * When opening the menu, set the first parent category as active.
	 */
	omegaActivator.addEventListener('click', function (event) {
		event.preventDefault();
		omegaNavigation.classList.toggle('is-open');
		document.documentElement.classList.toggle('has-active-navigation');
		setInitial();
	});

	if (typeof fastenHeader !== 'undefined') {
		let fastenHeaderTimeout;

		window.addEventListener('scroll', function () {
			'use strict';

			if (fastenHeaderTimeout) {
				window.cancelAnimationFrame(fastenHeaderTimeout);
			}

			fastenHeaderTimeout = window.requestAnimationFrame(function () {
				if (document.body.classList.contains('x-fasten-header--is-active')) {
					omegaNavigation.style.top = fastenHeader.parentElement.clientHeight + 'px';
				}
				else {
					omegaNavigation.style.top = 'auto';
				}
			});
		}, false);


		fastenHeaderActivator.addEventListener('click', function (event) {
			event.preventDefault();
			omegaActivator.click();
		});
	}

	/**
	 * Close the menu is the `Esc` key is pressed.
	 */
	window.addEventListener('keyup', function (keyEvent) {
		if (keyEvent.defaultPrevented) {
			return; // Do nothing if the event was already processed
		}

		let key = keyEvent.key || keyEvent.keyCode;
		switch (key) {
			case 'Escape':
			case 27:
				if (document.documentElement.classList.contains('has-active-navigation')) {
					omegaNavigation.classList.toggle('is-open');
					document.documentElement.classList.toggle('has-active-navigation');
					activeParent.classList.remove('is-active');
					activeTarget.classList.remove('is-active');
					setInitial();
				}
				break;
			default:
				return;
		}

		keyEvent.preventDefault();
	}, true);

	/**
	 * Close the menu if there are any clicks outside of the menu content.
	 */
	document.addEventListener('click', function (clickEvent) {
		if (clickEvent.target !== omegaActivator && clickEvent.target !== fastenHeaderActivator && clickEvent.target !== mobileActivator && document.documentElement.classList.contains('has-active-navigation')) {
			if (clickEvent.target.closest('[data-hook="omega-navigation__content"]')) {
				return;
			}
			omegaActivator.click();
		}
	});

	mobileActivator.addEventListener('click', function (event) {
		event.preventDefault();
		omegaNavigation.classList.toggle('is-open');
		document.documentElement.classList.toggle('has-active-navigation');
	});

	mobileCloser.addEventListener('click', function (event) {
		event.preventDefault();
		omegaNavigation.classList.toggle('is-open');
		document.documentElement.classList.toggle('has-active-navigation');
	});

	/**
	 * Check the screen size and run the appropriate functions.
	 */
	if (window.innerWidth < 992) {
		smallerScreenFunctionality();
	}
	else {
		largerScreenFunctionality();
	}

	window.addEventListener('resize', function () {
		if (omegaTimeout) {
			window.cancelAnimationFrame(omegaTimeout);
		}

		omegaTimeout = window.requestAnimationFrame(function () {
			if (window.innerWidth < 992) {
				smallerScreenFunctionality();
			}
			else {
				largerScreenFunctionality();
			}
		});
	}, false);

})(jQuery, window, document);
