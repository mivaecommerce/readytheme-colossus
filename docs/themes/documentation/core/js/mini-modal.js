/**
 * +-+-+-+-+-+-+-+-+-+-+
 * |m|i|n|i|-|m|o|d|a|l|
 * +-+-+-+-+-+-+-+-+-+-+
 *
 * Mini-modal is a lightweight and responsive light box plugin which supports images, YouTube, Vimeo, Google Maps,
 * Inline, Iframe, and AJAX content.
 *
 * Original minimodal.js script created by mdmoreau.
 * Version: 0.2.2
 * License: MIT
 * Homepage: https://github.com/mdmoreau/minimodal
 *
 * Updated version by Matt Zimmermann [https://github.com/influxweb]
 * Version: 1.0.0
 * License: MIT
 * Homepage: https://github.com/influxweb/minimodal
 *
 * The original script has been updated to allow for `inline` and `iframe` options. The CSS classes have been updated to
 * conform more with a name-spaced, BEM format.
 */

(function (root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define([], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	}
	else {
		root.minimodal = factory();
	}
}(this, function () {
	'use strict';

	var minimodal = function (target, options) {

		options = typeof options !== 'undefined' ? options : {};

		var _ = {};

		var option = function (property, value) {
			_.options[property] = typeof options[property] !== 'undefined' ? options[property] : value;
		};

		_.options = {};
		option('loadingHTML', 'Loading');
		option('previousButtonHTML', '&#139;');
		option('nextButtonHTML', '&#155;');
		option('closeButtonHTML', '&#215;');
		option('statusTimeout', 300);
		option('removeTimeout', 300);
		option('closeTimeout', 300);
		option('onLoaded', function () {});
		option('onClosed', function () {});
		option('googleMapsAPIKey', '');

		_.node = function (html) {
			var div = document.createElement('div');

			div.innerHTML = html;
			return div.firstChild;
		};

		_.setup = function (setTarget) {
			_.current = setTarget ? setTarget : target;
			_.minimodal = _.node('<div id="active-' + _.current.id + '" class="c-mini-modal" data-hook="active-' + _.current.id + '" tabindex="0" role="dialog">');
			_.overlay = _.node('<div class="c-mini-modal__overlay">');
			_.viewport = _.node('<div class="c-mini-modal__viewport">');
			_.closeButton = _.node('<button class="c-mini-modal__close">' + _.options.closeButtonHTML + '</button>');
		};

		_.build = function () {
			_.minimodal.appendChild(_.overlay);
			_.minimodal.appendChild(_.viewport);
			_.minimodal.appendChild(_.closeButton);
			document.body.appendChild(_.minimodal);
			_.minimodal.focus();
			_.minimodal.classList.add('c-mini-modal--active');
		};

		_.close = function () {
			var minimodal = _.minimodal;

			minimodal.classList.remove('c-mini-modal--active');
			setTimeout(function () {
				if (minimodal.parentNode) {
					minimodal.parentNode.removeChild(minimodal);
				}
			}, _.options.closeTimeout);
			document.documentElement.classList.remove('has-active-mini-modal');
			document.removeEventListener('keyup', _.keypress);
			if (target) {
				target.focus();
			}
			_.options.onClosed(_.type());
		};

		_.focusTrap = function (e) {
			if (e.shiftKey) {
				if (_.minimodal === document.activeElement) {
					e.preventDefault();
					_.closeButton.focus();
				}
			}
			else {
				if (_.closeButton === document.activeElement) {
					e.preventDefault();
					_.minimodal.focus();
				}
			}
		};

		_.keypress = function (event) {
			var key = event.key || event.keyCode;

			/* Tab Key */
			if (key === 'Tab' || key === 9) {
				_.focusTrap(event);
			}
			/* Esc Key */
			else if (key === 'Escape' || key === 27) {
				_.close();
			}
			/* Right Arrow */
			else if (key === 'ArrowRight' || key === 37) {
				if (_.index > -1) {
					_.previous();
				}
			}
			/* Left Arrow */
			else if (key === 'ArrowLeft' || key === 39) {
				if (_.index > -1) {
					_.next();
				}
			}
		};

		_.listen = function () {
			_.overlay.addEventListener('click', _.close);
			_.closeButton.addEventListener('click', _.close);
			document.addEventListener('keyup', _.keypress);
		};

		_.reflow = function () {
			var x = _.minimodal.clientWidth;
		};

		_.loading = function () {
			_.status = _.node('<div class="c-mini-modal__status">' + _.options.loadingHTML + '</div>');
			_.item.appendChild(_.status);
			_.reflow();
			_.item.classList.add('c-mini-modal__item--loading');
		};

		_.loaded = function () {
			var status = _.status;

			document.documentElement.classList.add('has-active-mini-modal');
			setTimeout(function () {
				if (status.parentNode) {
					status.parentNode.removeChild(status);
				}
			}, _.options.statusTimeout);
			_.item.appendChild(_.content);
			if (_.current.getAttribute('title')) {
				_.caption = _.node('<div class="c-mini-modal__caption">' + _.current.getAttribute('title'));
				_.item.appendChild(_.caption);
			}
			_.item.classList.remove('c-mini-modal__item--loading');
			_.reflow();
			_.item.classList.add('c-mini-modal__item--loaded');
			_.openCallback();
			_.options.onLoaded(_.type());
		};

		_.openCallback = function () {
			var openCallback = _.current.hasAttribute('data-mini-modal-openCallback') ? _.current.getAttribute('data-mini-modal-openCallback') : null;

			if (typeof mivaJS[openCallback] === 'function') {
				//console.log('this is a function');
				_.item.setAttribute('data-hook', openCallback);
				mivaJS[openCallback](_.item.getAttribute('data-hook'));
			}
		};

		_.error = function () {
			_.status.innerHTML = 'Error loading resource';
		};

		_.selectorExists = function (selector) {
			try {
				return document.querySelector(selector).length !== 0;
			} catch (e) {
				return false;
			}
		};

		_.ajax = function () {
			var url = _.url;
			var request = new XMLHttpRequest();

			request.open('GET', url, true);
			request.onload = function () {
				if (url === _.url) {
					if (request.status >= 200 && request.status < 400) {
						var response = request.responseText;

						_.content = _.node('<div class="c-mini-modal__content"><div class="c-mini-modal__element active-' + _.current.id + '">' + response);
						_.loaded();
					}
					else {
						_.error();
					}
				}
			};
			request.onerror = function () {
				if (url === _.url) {
					_.error();
				}
			};
			request.send();
		};

		_.googleMaps = function () {
			var src = 'https://www.google.com/maps/embed/v1/';
			var apiKey = _.options.googleMapsAPIKey;

			if (_.url.indexOf('/maps/place/') > -1) {
				var place = _.url.match('(?:/maps/place/)([^/]+)')[1];

				src += 'place?key=' + apiKey + '&q=' + place;
			}
			else {
				var coords = _.url.match('(?:/maps/@)([^z]+)')[1];

				coords = coords.split(',');

				var lat = coords[0];
				var long = coords[1];
				var zoom = coords[2];

				src += 'view?key=' + apiKey + '&center=' + lat + ',' + long + '&zoom=' + zoom + 'z';
			}
			_.content = _.node('<div class="c-mini-modal__content"><iframe class="c-mini-modal__element c-mini-modal__element--map active-' + _.current.id + '" src="' + src + '" frameborder="0">');
			_.loaded();
		};

		_.youtube = function () {
			var id = _.url.split('v=')[1];

			_.content = _.node('<div class="c-mini-modal__content"><div class="c-mini-modal__element c-mini-modal__element--video active-' + _.current.id + '"><iframe class="c-mini-modal__video" src="https://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen>');
			_.loaded();
		};

		_.vimeo = function () {
			var id = _.url.split('vimeo.com/')[1];

			_.content = _.node('<div class="c-mini-modal__content"><div class="c-mini-modal__element c-mini-modal__element--video active-' + _.current.id + '"><iframe class="c-mini-modal__video" src="https://player.vimeo.com/video/' + id + '" frameborder="0" allowfullscreen>');
			_.loaded();
		};

		_.iframe = function () {
			var url = _.url;

			if (url === _.url) {
				_.content = _.node('<div class="c-mini-modal__content"><div class="c-mini-modal__element c-mini-modal__element--iframe active-' + _.current.id + '"><iframe class="c-mini-modal__iframe" src="' + url + '" frameborder="0" allowfullscreen>');
				_.loaded();
			}
		};

		_.inline = function () {
			var url = _.url;

			if (url === _.url) {
				if (_.selectorExists(url) || _.selectorExists('[' + _.current.getAttribute('data-mini-modal-content') + ']')) {
					var inlineContent;

					if (_.selectorExists(url)) {
						inlineContent = document.querySelector(url);
					}
					else {
						inlineContent = document.querySelector('[' + _.current.getAttribute('data-mini-modal-content') + ']');
					}

					if (inlineContent.nodeName.toLowerCase() === 'img') {
						var img = document.createElement('img');
						var imgSrc = inlineContent.getAttribute('src');
						var imgAlt = inlineContent.getAttribute('alt');

						img.onload = function () {
							if (url === _.url) {
								_.content = _.node('<div class="c-mini-modal__content"><img class="c-mini-modal__element active-' + _.current.id + '" src="' + imgSrc + '" alt="' + imgAlt + '">');
								_.loaded();
							}
						};
						img.onerror = function () {
							if (url === _.url) {
								_.error();
							}
						};
						img.src = imgSrc;
					}
					else {
						_.content = _.node('<div class="c-mini-modal__content"><div class="c-mini-modal__element active-' + _.current.id + '">' + inlineContent.innerHTML);
						_.loaded();
					}
				}
				else {
					_.iframe();
				}
			}
		};

		_.image = function () {
			var url = _.url;
			var img = document.createElement('img');

			img.onload = function () {
				if (url === _.url) {
					_.content = _.node('<div class="c-mini-modal__content"><img class="c-mini-modal__element active-' + _.current.id + '" src="' + _.url + '" alt="' + _.current.getAttribute('title') + '">');
					_.loaded();
				}
			};
			img.onerror = function () {
				if (url === _.url) {
					_.error();
				}
			};
			img.src = url;
		};

		_.type = function () {
			if (_.current.getAttribute('data-mini-modal-type')) {
				return _.current.getAttribute('data-mini-modal-type');
			}
			else if (_.url.indexOf('google.com/maps') > -1) {
				return 'googleMaps';
			}
			else if (_.url.indexOf('youtube.com') > -1) {
				return 'youtube';
			}
			else if (_.url.indexOf('vimeo.com') > -1) {
				return 'vimeo';
			}
			else {
				return 'image';
			}
		};

		_.load = function (change) {
			_.url = _.current.getAttribute('href');
			_.item = _.node('<div class="c-mini-modal__item">');
			_.viewport.appendChild(_.item);
			if (change) {
				_.item.classList.add('c-mini-modal__item--added');
				_.item.classList.add('c-mini-modal__item--added--' + change);
				_.reflow();
				_.item.classList.remove('c-mini-modal__item--added');
				_.item.classList.remove('c-mini-modal__item--added--' + change);
			}
			_.loading();
			_[_.type()]();
		};

		_.remove = function (change) {
			var item = _.item;

			item.classList.add('c-mini-modal__item--removed');
			item.classList.add('c-mini-modal__item--removed--' + change);
			setTimeout(function () {
				if (item.parentNode) {
					item.parentNode.removeChild(item);
				}
			}, _.options.removeTimeout);
		};

		_.update = function (change) {
			_.remove(change);
			_.current = _.groupItems[_.index];
			_.load(change);
		};

		_.previous = function () {
			if (_.index - 1 < 0) {
				_.index = _.indexMax;
			}
			else {
				_.index -= 1;
			}
			_.update('previous');
		};

		_.next = function () {
			if (_.index + 1 > _.indexMax) {
				_.index = 0;
			}
			else {
				_.index += 1;
			}
			_.update('next');
		};

		_.nav = function () {
			_.previousButton = _.node('<button class="c-mini-modal__nav c-mini-modal__nav--previous">' + _.options.previousButtonHTML + '</button>');
			_.nextButton = _.node('<button class="c-mini-modal__nav c-mini-modal__nav--next">' + _.options.nextButtonHTML + '</button>');
			_.minimodal.insertBefore(_.previousButton, _.closeButton);
			_.minimodal.insertBefore(_.nextButton, _.closeButton);
			_.previousButton.addEventListener('click', _.previous);
			_.nextButton.addEventListener('click', _.next);
		};

		_.group = function () {
			_.groupID = _.current.getAttribute('data-mini-modal');
			if (_.groupID) {
				_.groupItems = document.querySelectorAll('[data-mini-modal="' + _.groupID + '"]');
				if (_.groupItems.length > 1) {
					_.index = Array.prototype.indexOf.call(_.groupItems, _.current);
					_.indexMax = _.groupItems.length - 1;
					_.nav();
				}
			}
		};

		_.open = function (e) {
			e.preventDefault();
			_.setup();
			_.build();
			_.listen();
			_.load();
			_.group();
		};

		_.openModal = function (setTarget) {
			_.setup(setTarget);
			_.build();
			_.listen();
			_.load();
			_.group();
		};

		_.closeModal = function (activeModal) {
			activeModal.classList.remove('c-mini-modal--active');
			setTimeout(function () {
				if (activeModal.parentNode) {
					activeModal.parentNode.removeChild(activeModal);
				}
			}, _.options.closeTimeout);
			document.documentElement.classList.remove('has-active-mini-modal');
			document.removeEventListener('keyup', _.keypress);
			_.options.onClosed();
		};

		_.init = function () {
			target.addEventListener('click', _.open);
		};

		return _;

	};

	return minimodal;

}));
