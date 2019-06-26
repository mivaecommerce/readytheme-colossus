(function (window) {
	function define_library() {
		'use strict';

		// Create the library object and all its properties and methods.
		var conveyor = {};
		var settings;
		var navigationClicked;
		var slideInterval;

		// Default settings
		var defaults = {
			carousel: '[data-hook="carousel"]',
			carouselNext: '[data-hook="carousel__button-next"]',
			carouselPrevious: '[data-hook="carousel__button-previous"]',
			carouselContainer: '[data-hook="carousel__container"]',
			carouselItems: '[data-hook="carousel__item"]',
			carouselDelay: 5000,
			autoStart: false
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
					preloadImage(image);
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
				else if(!imgDefer[i].getAttribute('data-src') || !container.classList.contains('x-carousel--is-loaded')) {
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

			elem.addEventListener('touchstart', handleEvent, false);
			elem.addEventListener('touchmove', handleEvent, false);
			elem.addEventListener('touchend', handleEvent, false);
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



		conveyor.init = function (options) {
			// Merge user options with defaults
			settings = extend(defaults, options || {}); // Merge user options with defaults

			var carousel = document.querySelector('[data-hook="hero-carousel"]');

			if (!carousel) {
				console.warn('No carousel item could be found. Please check your HTML code and herosel.init() settings.');
				return;
			}

			var carouselNext = carousel.querySelector('[data-hook="carousel__button-next"]');
			var carouselPrevious = carousel.querySelector('[data-hook="carousel__button-previous"]');
			var carouselContainer = carousel.querySelector('[data-hook="carousel__container"]');
			var carouselItems = carouselContainer.querySelectorAll('[data-hook="carousel__item"]');

			/**
			 * toggleReverse change class of .x-carousel__container element
			 * @private
			 * @param check {boolean} compare if .x-carousel__container element contains .x-carousel
			 * @param action {string} [add, remove]
			 */
			var toggleReverse = function (check, action) {
				if (carouselContainer.classList.contains('x-carousel--reverse') === check) {
					carouselContainer.classList[action]('x-carousel--reverse');
				}
			};

			/**
			 * toggleAnimate add or remove .x-carousel--animate to .x-carousel__container element
			 * @private
			 */
			var toggleAnimate = function () {
				carouselContainer.classList.toggle('x-carousel--animate');
			};

			/**
			 * observation watches each carousel item and lazy-loads its image(s)
			 */
			var observation = function () {
				for (var idx = 0, cI = carouselItems.length; idx < cI; idx++) {
					createObserver(carousel, carouselItems[idx]);
				}
			};
			observation();


			/**
			 * setOrder change dynamically the order of all .x-carousel__item elements
			 * @private
			 */
			var setOrder = function (direction) {
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


			// Initialize order of .x-carousel__item
			if (carouselItems.length === 1) {
				toggleAnimate();
			}
			setOrder();


			/**
			 * This function will move to the next item in the carousel
			 * @public
			 */
			conveyor.onRightClick = function () {
				// remove reverse
				toggleReverse(true, 'remove');
				// Disable transition to instant change order
				toggleAnimate();
				// Change order of element
				// Current order 2 visible become order 3
				setOrder('right');
				// Enable transition to animate order 3 to order 2
				setTimeout(toggleAnimate, 50);
			};

			/**
			 * This function will move to the previous item in the carousel
			 * @public
			 */
			conveyor.onLeftClick = function () {
				// add reverse
				toggleReverse(false, 'add');
				// Disable transition to instant change order
				toggleAnimate();
				// Change order of element
				// Current order 2 visible become order 1
				setOrder('left');
				// Enable transition to animate order 1 to order 2
				setTimeout(toggleAnimate, 50);
			};

			if (carouselItems.length > 1 && carouselPrevious && carouselNext) {
				carouselPrevious.addEventListener('click', function (event) {
					navigationClicked = true;
					clearInterval(slideInterval);
					slideInterval = null;
					conveyor.onLeftClick(event);
				}, false);

				carouselNext.addEventListener('click', function (event) {
					navigationClicked = true;
					clearInterval(slideInterval);
					slideInterval = null;
					conveyor.onRightClick(event);
				}, false);
			}

			if (carouselItems.length > 1) {
				new Glide(carouselContainer, function (event, direction) {
					event.preventDefault();

					switch (direction) {
						case 'up':
							break;
						case 'down':
							break;
						case 'left':
							navigationClicked = true;
							clearInterval(slideInterval);
							slideInterval = null;
							conveyor.onRightClick(event);
							break;
						case 'right':
							navigationClicked = true;
							clearInterval(slideInterval);
							slideInterval = null;
							conveyor.onLeftClick(event);
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
						slideInterval = setInterval(conveyor.onRightClick, settings.carouselDelay);
					}
				}, false);

				slideInterval = setInterval(conveyor.onRightClick, settings.carouselDelay);
			}


		};
		return conveyor;
	}

	// Add the conveyor object to global scope if its not already defined.
	if (typeof(conveyor) === 'undefined') {
		window.conveyor = define_library();
	}
	else {
		console.log("Library already defined.");
	}
})(window);
