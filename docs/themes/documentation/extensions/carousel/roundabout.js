/**
 +-+-+-+-+-+-+-+-+-+-+
 |r|o|u|n|d|a|b|o|u|t|
 +-+-+-+-+-+-+-+-+-+-+
 *
 * Roundabout is a flex based carousel function written in, mostly, vanilla
 * JavaScript. The function is called through a standard jQuery function call.
 *
 * To utilize the script, include it in your project as well as the associated
 * CSS file.
 *
 * Initialize the function using the following call:
 *
 	$.hook('ELEMENT').roundabout(); or $('ELEMENT').roundabout();
 *
 * You can also pass the following settings to change the elements being called by the function:
 *
 * autoStart: false \\ [Boolean] - Set to `true` for automatic cycling
 * carouselDelay: 5000 \\ [Integer] - Set delay between slide display for automatic cycling
 * group: false \\ [Boolean] - Set to `true` to create grouping of elements based on breakpoint
 * groupClass: 'x-carousel__item' \\ [String} - Set the class to be used for element groups
 * groupTiny: 2 \\ [Integer] - Set number of elements to show on screens < 640px
 * groupSmall: 2 \\ [Integer] - Set number of elements to show on screens between 640px and 767px
 * groupMedium: 4 \\ [Integer] - Set number of elements to show on screens between 768px and 959px
 * groupLarge: 4 \\ [Integer] - Set number of elements to show on screens between 960px and 1439px
 * groupWide: 4 \\ [Integer] - Set number of elements to show on screens >= 1440px
 * groupWrapper: 'figure' \\ [String} - Set element to wrap groups with
 *
	 $.hook('carousel').roundabout({
		autoStart: false,
		carouselDelay: 5000,
		group: false,
		groupClass: 'x-carousel__item',
		groupTiny: 2,
		groupSmall: 2,
		groupMedium: 4,
		groupLarge: 4,
		groupWide: 4,
		groupWrapper: 'figure'
	});
 *
 * Inspired by https://blog.madewithenvy.com/the-order-property-flexbox-carousels-87a168567820
 *
 * Current item visible is always order 2
 * Animate is order 1 -> 2
 * Animate reverse is order 2 <- 3
 */

(function (window, document, undefined) {
	var ride = function () {
		'use strict';

		var defaults = {
			autoStart: false,
			carouselDelay: 5000,
			group: false,
			groupClass: 'x-carousel__item',
			groupTiny: 2,
			groupSmall: 2,
			groupMedium: 4,
			groupLarge: 4,
			groupWide: 4,
			groupWrapper: 'figure'
		};

		/**
		 * Merge defaults with user options.
		 * @private
		 * @returns {Object} Merged values of defaults and options
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
		 * Create an IntersectionObserver
		 * @private
		 * @param {Object} carousel
		 * @param {Object} carouselItem
		 */
		var createObserver = function (carousel, carouselItem) {
			var observer;
			var images = carouselItem.querySelectorAll('img');
			var options = {
				root: carousel,
				rootMargin: '0px',
				threshold: 0.1
			};

			// If we don't have support for intersection observer, load the images immediately
			if (!('IntersectionObserver' in window)) {
				images.forEach(function (image) {
					preloadImage(carousel, image);
				});
			}
			else {
				// It is supported, load the images
				observer = new IntersectionObserver(handleIntersect, options);
				observer.observe(carouselItem);
			}
		};

		/**
		 * Control what happens when the entry is in view
		 * @private
		 * @param entries
		 * @param observer
		 */
		var handleIntersect = function (entries, observer) {
			entries.forEach(function (entry) {
				// Are we in viewport?
				if (entry.intersectionRatio > 0) {
					//console.log(entry.target);
					//console.log(observer.root);
					observer.unobserve(entry.target);
					preloadImage(observer.root, entry.target);
				}
			});
		};

		/**
		 * Apply the `lazy-load` source as the image source
		 * @private
		 * @param {Object} container
		 * @param {Object} image
		 */
		var preloadImage = function (container, image) {
			var imgDefer = image.querySelectorAll('img');

			for (var i = 0; i < imgDefer.length; i++) {
				if (imgDefer[i].getAttribute('data-src')) {
					imgDefer[i].setAttribute('src', imgDefer[i].getAttribute('data-src'));
					imgDefer[i].addEventListener('load', function () {
						if (!container.classList.contains('x-carousel--is-loaded')) {
							container.classList.add('x-carousel--is-loaded');
						}
						this.removeAttribute('data-src');
						this.removeAttribute('style');
					});
				}
				else if (!imgDefer[i].getAttribute('data-src') || !container.classList.contains('x-carousel--is-loaded')) {
					container.classList.add('x-carousel--is-loaded');
				}
			}
		};

		/**
		 * Swipe Functionality
		 * @param elem
		 * @param callback
		 * @constructor
		 */
		function Glide(elem, callback) {
			var self = this;

			this.callback = callback;

			function handleEvent(e) {
				self.touchHandler(e);
			}

			/**
			 * Because older browsers will interpret any object in the 3rd
			 * argument as a true value for the capture argument, we are using
			 * feature detection for the passive EventListenerOption.
			 */
			var passiveSupported = false;

			try {
				var options = {
					get passive() {
						passiveSupported = true;
					}
				};

				window.addEventListener('test', options, options);
				window.removeEventListener('test', options, options);
			}
			catch (err) {
				passiveSupported = false;
			}

			elem.addEventListener('touchstart', handleEvent, passiveSupported ? {passive: true} : false);
			elem.addEventListener('touchmove', handleEvent, passiveSupported ? {passive: true} : false);
			elem.addEventListener('touchend', handleEvent, passiveSupported ? {passive: true} : false);
		}

		Glide.prototype.touches = {
			'touchstart': {
				'x': -1,
				'y': -1
			},
			'touchmove': {
				'x': -1,
				'y': -1
			},
			'touchend': false,
			'direction': 'undetermined'
		};

		Glide.prototype.touchHandler = function (event) {
			var touch;

			if (typeof event !== 'undefined') {
				if (typeof event.touches !== 'undefined') {
					touch = event.touches[0];

					switch (event.type) {
						case 'touchstart':
						case 'touchmove':
							this.touches[event.type].x = touch.pageX;
							this.touches[event.type].y = touch.pageY;
							break;
						case 'touchend':
							this.touches[event.type] = true;

							var x = (this.touches.touchstart.x - this.touches.touchmove.x),
								y = (this.touches.touchstart.y - this.touches.touchmove.y);

							if (x < 0) {
								x /= -1;
							}
							if (y < 0) {
								y /= -1;
							}
							if (x > y) {
								this.touches.direction = this.touches.touchstart.x < this.touches.touchmove.x ? 'right' : 'left';
							}
							else {
								this.touches.direction = this.touches.touchstart.y < this.touches.touchmove.y ? 'down' : 'up';
							}
							this.callback(event, this.touches.direction);
							break;
					}
				}
			}
		};

		/**
		 * toggleReverse change class of .x-carousel__container element
		 * @private
		 * @param check {boolean} compare if .x-carousel__container element contains .x-carousel
		 * @param action {string} [add, remove]
		 * @param carouselContainer object
		 */
		var toggleReverse = function (check, action, carouselContainer) {
			if (carouselContainer.classList.contains('x-carousel--reverse') === check) {
				carouselContainer.classList[action]('x-carousel--reverse');
			}
		};

		/**
		 * toggleAnimate add or remove .x-carousel--animate to .x-carousel__container element
		 * @private
		 */
		var toggleAnimate = function (carouselContainer) {
			carouselContainer.classList.toggle('x-carousel--animate');
		};

		/**
		 * observation watches each carousel item and lazy-loads its image(s)
		 */
		var observation = function (carousel, carouselItems) {
			for (var idx = 0, cI = carouselItems.length; idx < cI; idx++) {
				if (!('IntersectionObserver' in window)) {
					preloadImage(carousel, carouselItems[idx]);
				}
				else {
					createObserver(carousel, carouselItems[idx]);
				}
			}
		};

		/**
		 * setOrder change dynamically the order of all .x-carousel__item elements
		 * @private
		 */
		var setOrder = function (direction, carouselItems) {
			// initialize direction to change order
			if (direction === 'left') {
				direction = 1;
			}
			else if (direction === 'right') {
				direction = -1;
			}

			for (var i = 0, c = carouselItems.length; i < c; i++) {
				if (carouselItems[i].style.order) { // change order with direction
					var newValue = (parseInt(carouselItems[i].style.order, 10) + direction) % c;
					carouselItems[i].style.order = newValue ? newValue : c;

				}
				else { // Initialize
					if (i === (carouselItems.length - 1)) {
						carouselItems[i].style.order = 1;
					}
					else {
						carouselItems[i].style.order = i + 2;
					}
				}
			}

		};

		/**
		 * This function will move to the next item in the carousel
		 * @public
		 */
		var onRightClick = function (carouselContainer, carouselItems) {
			// remove reverse
			toggleReverse(true, 'remove', carouselContainer);
			// Disable transition to instant change order
			toggleAnimate(carouselContainer);
			// Change order of element
			// Current order 2 visible become order 3
			setOrder('right', carouselItems);
			// Enable transition to animate order 3 to order 2
			setTimeout(function () {
				toggleAnimate(carouselContainer);
			}, 50);
		};

		/**
		 * This function will move to the previous item in the carousel
		 * @public
		 */
		var onLeftClick = function (carouselContainer, carouselItems) {
			// add reverse
			toggleReverse(false, 'add', carouselContainer);
			// Disable transition to instant change order
			toggleAnimate(carouselContainer);
			// Change order of element
			// Current order 2 visible become order 1
			setOrder('left', carouselItems);
			// Enable transition to animate order 1 to order 2
			setTimeout(function () {
				toggleAnimate(carouselContainer);
			}, 50);
		};

		var setGrouping = function (carouselItems, settings) {
			if (window.matchMedia('(max-width: 639px)').matches) {
				$(carouselItems).groupEvery(settings.groupTiny, settings.groupWrapper, settings.groupClass);
			}
			else if (window.matchMedia('(min-width: 640px) and (max-width: 767px)').matches) {
				$(carouselItems).groupEvery(settings.groupSmall, settings.groupWrapper, settings.groupClass);
			}
			else if (window.matchMedia('(min-width: 768px) and (max-width: 959px)').matches) {
				$(carouselItems).groupEvery(settings.groupMedium, settings.groupWrapper, settings.groupClass);
			}
			else if (window.matchMedia('(min-width: 960px) and (max-width: 1439px)').matches) {
				$(carouselItems).groupEvery(settings.groupLarge, settings.groupWrapper, settings.groupClass);
			}
			else if (window.matchMedia('(min-width: 1440px)').matches)  {
				$(carouselItems).groupEvery(settings.groupWide, settings.groupWrapper, settings.groupClass);
			}
		};

		var hideCTA = function (carouselItems, carouselItemElements, carouselPrevious, carouselNext, settings) {
			if (window.matchMedia('(max-width: 639px)').matches) {
				if (carouselItemElements < settings.groupTiny) {
					carouselItems[0].style.justifyContent = 'center';
					carouselPrevious.style.display = 'none';
					carouselNext.style.display = 'none';
				}
				else {
					carouselItems.style.justifyContent = 'flex-start';
					carouselPrevious.style.display = 'inline-block';
					carouselNext.style.display = 'inline-block';
				}
			}
			else if (window.matchMedia('(min-width: 640px) and (max-width: 767px)').matches) {
				if (carouselItemElements < settings.groupSmall) {
					carouselItems[0].style.justifyContent = 'center';
					carouselPrevious.style.display = 'none';
					carouselNext.style.display = 'none';
				}
				else {
					carouselItems.style.justifyContent = 'flex-start';
					carouselPrevious.style.display = 'inline-block';
					carouselNext.style.display = 'inline-block';
				}
			}
			else if (window.matchMedia('(min-width: 768px) and (max-width: 959px)').matches) {
				if (carouselItemElements < settings.groupMedium) {
					carouselItems[0].style.justifyContent = 'center';
					carouselPrevious.style.display = 'none';
					carouselNext.style.display = 'none';
				}
				else {
					carouselItems.style.justifyContent = 'flex-start';
					carouselPrevious.style.display = 'inline-block';
					carouselNext.style.display = 'inline-block';
				}
			}
			else if (window.matchMedia('(min-width: 960px) and (max-width: 1439px)').matches) {
				if (carouselItemElements < settings.groupLarge) {
					carouselItems[0].style.justifyContent = 'center';
					carouselPrevious.style.display = 'none';
					carouselNext.style.display = 'none';
				}
				else {
					carouselItems[0].style.justifyContent = 'flex-start';
					carouselPrevious.style.display = 'inline-block';
					carouselNext.style.display = 'inline-block';
				}
			}
			else if (window.matchMedia('(min-width: 1440px)').matches)  {
				if (carouselItemElements < settings.groupWide) {
					carouselItems[0].style.justifyContent = 'center';
					carouselPrevious.style.display = 'none';
					carouselNext.style.display = 'none';
				}
				else {
					carouselItems[0].style.justifyContent = 'flex-start';
					carouselPrevious.style.display = 'inline-block';
					carouselNext.style.display = 'inline-block';
				}
			}
		};

		var roundabout = function (target, options) {
			var navigationClicked;
			var slideInterval;
			var carousel = (typeof target === 'string') ? document.querySelector(target) : target;
			var settings = extend(defaults, options || {}); // Merge user options with defaults

			if (!carousel) {
				console.warn('No carousel item could be found. Please check your HTML code and hero.init() settings.');
				return;
			}

			var carouselNext = carousel.querySelector('[data-hook~="carousel__button-next"]');
			var carouselPrevious = carousel.querySelector('[data-hook~="carousel__button-previous"]');
			var carouselContainer = carousel.querySelector('[data-hook~="carousel__container"]');
			var carouselItems = carouselContainer.children;
			var carouselItemElements = carouselItems[0].childElementCount;

			/**
			 * If the carousel needs to group items together, group and recheck on resize
			 */
			if (settings.group) {
				var waitForIt;
				var cachedWidth = document.documentElement.clientWidth;

				setGrouping(carouselItems, settings);
				window.addEventListener('resize', function (event) {
					var itemElements = carousel.querySelectorAll('.'+ settings.groupClass);

					if (!waitForIt) {
						waitForIt = setTimeout(function () {
							var window_changed = document.documentElement.clientWidth !== cachedWidth;

							if (window_changed) {
								waitForIt = null;

								/**
								 * "unwrap" all the carousel groups and rebuild them based on screen size
								 */
								for (var i = 0, c = itemElements.length; i < c; i++) {
									itemElements[i].outerHTML = itemElements[i].innerHTML;
								}

								setGrouping(carouselItems, settings);
							}
						}, 66);
					}
				}, false);
			}
			else {
				$(carouselItems).groupEvery(1, settings.groupWrapper, settings.groupClass);
			}

			if (carouselItems.length === 1) {
				var timeToStall;

				hideCTA(carouselItems, carouselItemElements, carouselPrevious, carouselNext, settings);
				window.addEventListener('resize', function (event) {
					if (!timeToStall) {
						timeToStall = setTimeout(function () {
							timeToStall = null;

							hideCTA(carouselItems, carouselItemElements, carouselPrevious, carouselNext, settings);
						}, 66);
					}
				}, false);
			}

			observation(carousel, carouselItems);

			// Initialize order of .x-carousel__item
			if (carouselItems.length === 1) {
				toggleAnimate(carouselContainer);
			}
			setOrder(null, carouselItems);

			if (carouselItems.length > 1 && carouselPrevious && carouselNext) {
				carouselPrevious.addEventListener('click', function (event) {
					navigationClicked = true;
					clearInterval(slideInterval);
					slideInterval = null;
					onLeftClick(carouselContainer, carouselItems);
				}, false);

				carouselNext.addEventListener('click', function (event) {
					navigationClicked = true;
					clearInterval(slideInterval);
					slideInterval = null;
					onRightClick(carouselContainer, carouselItems);
				}, false);
			}

			if (carouselItems.length > 1) {
				new Glide(carouselContainer, function (event, direction) {
					switch (direction) {
						case 'up':
							navigationClicked = false;
							break;
						case 'down':
							navigationClicked = false;
							break;
						case 'left':
							navigationClicked = true;
							clearInterval(slideInterval);
							slideInterval = null;
							onRightClick(carouselContainer, carouselItems);
							break;
						case 'right':
							navigationClicked = true;
							clearInterval(slideInterval);
							slideInterval = null;
							onLeftClick(carouselContainer, carouselItems);
							break;
					}
				});
			}

			if (settings.autoStart) {
				carouselContainer.addEventListener('mouseover', function () {
					clearInterval(slideInterval);
					slideInterval = null;
				}, false);

				carouselContainer.addEventListener('mouseout', function () {
					if (!navigationClicked) {
						slideInterval = setInterval(function () {
							onRightClick(carouselContainer, carouselItems);
						}, settings.carouselDelay);
					}
				}, false);

				slideInterval = setInterval(function () {
					onRightClick(carouselContainer, carouselItems);
				}, settings.carouselDelay);
			}
		};


		return {
			roundabout: roundabout
		};

	}();

	$.fn.wrapElements = function (html) {
		if (jQuery.isFunction(html)) {
			return this.each(function (i) {
				jQuery(this).wrapElements(html.call(this, i));
			});
		}

		if (this[0]) {
			// The elements to wrap the target around
			var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

			if (this[0].parentNode) {
				wrap.insertBefore(this[0]);
			}

			wrap.map(function () {
				var elem = this;

				while (elem.firstChild && elem.firstChild.nodeType === 1) {
					elem = elem.firstChild;
				}

				return elem;
			});
			wrap.append(this);
		}

		return this;
	};

	$.fn.groupEvery = function (cLen, wrapperEl, wrapperClass) {
		var wrapper = document.createElement(wrapperEl);

		wrapper.classList.add(wrapperClass);
		while (this.length) {
			$(this.splice(0, cLen)).wrapElements(wrapper);
		}
	};

	// extend the jQuery object
	var jq = window.$ || window.jQuery;

	jq && (jq.fn.extend({
		roundabout: function (options) {
			return this.each(function () {
				ride.roundabout(this, options);
			});
		}
	}));

})(window, document);
