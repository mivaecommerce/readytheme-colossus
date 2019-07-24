/**
 * Use this file to all in scripts and functions you would like to have globally or on specific
 * pages. You will use this to extend your theme instead of adding code to the core framework files.
 */

var themeFunctionality = {
	init: function () {
		/**
		 * Load and initialize the Fasten Header extension
		 */
		const fastenHeaderActive = document.querySelector('[data-hook="fasten-header"]');

		if (typeof fastenHeaderActive !== 'undefined') {
			$.loadScript(theme_path + 'extensions/fasten-header/fasten-header.js');
		}


		/**
		 * Load and initialize the Show Related extension
		 */
		$.loadScript(theme_path + 'extensions/show-related/show-dont-tell.js');


		/**
		 * Load and initialize the Mini-Basket extension
		 */
		$.loadScript(theme_path + 'extensions/mini-basket/mini-basket.js', function () {
			miniBasket.init();
		});

			/**
			 * If clicking outside of the mini-basket, close the mini-basket.
			 */
			(function () {
				let miniBasket = document.querySelector('[data-hook="mini-basket"]');

				/**
				 * Polyfill for browsers that do not support Element.matches() [IE 11]
				 */
				if (!Element.prototype.matches) {
					Element.prototype.matches = Element.prototype.msMatchesSelector;
				}

				/**
				 * Polyfill for browsers that do not support Element.closest() [IE 11]
				 */
				if (!Element.prototype.closest) {
					Element.prototype.closest = function (s) {
						let el = this;

						if (!document.documentElement.contains(el)) {
							return null;
						}
						do {
							if (el.matches(s)) {
								return el;
							}
							el = el.parentElement || el.parentNode;
						}
						while (el !== null && el.nodeType === 1);
						return null;
					};
				}

				document.addEventListener('click', function (event) {
					if (event.target.closest('[data-hook="mini-basket"]')) {
						return;
					}

					if (event.target.closest('[data-hook~="open-mini-basket"]') && miniBasket.classList.contains('x-mini-basket--open')) {
						event.preventDefault();
						event.stopImmediatePropagation();
						document.documentElement.classList.remove('u-overflow-hidden');
						document.documentElement.classList.remove('x-mini-basket-is-active');
						miniBasket.classList.remove('x-mini-basket--open');
					}

					if (miniBasket.classList.contains('x-mini-basket--open')) {
						document.documentElement.classList.toggle('u-overflow-hidden');
						document.documentElement.classList.toggle('x-mini-basket-is-active');
						miniBasket.classList.toggle('x-mini-basket--open');
					}
				});
			})();


		/**
		 * Load and initialize the Omega Navigation extension
		 */
		$.loadScript(theme_path + 'extensions/navigation/omega/omega-navigation.js');


		/**
		 * Load and initialize the Collapsing Breadcrumbs extension
		 */
		$.loadScript(theme_path + 'extensions/breadcrumbs/collapsing/collapsing-breadcrumbs.js');


		/**
		 * This is a a minimal polyfill for <template> use in IE 9-11.
		 * http://ironlasso.com/template-tag-polyfill-for-internet-explorer/
		 */
		Element.prototype.getTemplateContent = function () {
			'use strict';

			return function (element) {

				if (element.content) {
					return element.content;
				}

				var template = element,
					templateContent,
					documentContent;

				templateContent = template.childNodes;
				documentContent = document.createDocumentFragment();

				while (templateContent[0]) {
					documentContent.appendChild(templateContent[0]);
				}

				template.content = documentContent;
				return documentContent;

			}(this);
		};


		/**
		 * This is a basic "lazy-load" function for complete DOM sections and images
		 * base of `data-` attributes.
		 */
		function observeDeferred() {
			'use stict';

			const deferredDOMItems = document.querySelectorAll('[data-defer]');
			const deferredImages = document.querySelectorAll('[data-src]');
			const config = {
				root: null, // avoiding 'root' or setting it to 'null' sets it to default value: viewport
				rootMargin: '0px',
				threshold: 0.25
			};

			if ('IntersectionObserver' in window) {
				let deferredObjectsObserver = new IntersectionObserver(function (DOMItems, self) {
					DOMItems.forEach(function (DOMItem) {
						if (DOMItem.isIntersecting) {
							loadDOMItems(DOMItem.target);
							// Stop watching and load the deferred object
							self.unobserve(DOMItem.target);
						}
					});
				}, config);
				let deferredImagesObserver = new IntersectionObserver(function (images, self) {
					images.forEach(function (image) {
						if (image.isIntersecting) {
							loadImages(image.target);
							// Stop watching and load the deferred object
							self.unobserve(image.target);
						}
					});
				}, config);

				deferredDOMItems.forEach(function (deferredDOMItem) {
					deferredObjectsObserver.observe(deferredDOMItem);
				});
				deferredImages.forEach(function (deferredImage) {
					deferredImagesObserver.observe(deferredImage);
				});
			}
			else {
				Array.from(deferredDOMItems).forEach(function (deferredDOMItem) {
					return loadDOMItems(deferredDOMItem);
				});
				Array.from(deferredImages).forEach(function (deferredImage) {
					return loadImages(deferredImage);
				});
			}

			function loadDOMItems(deferredObject) {
				deferredObject.classList.add('t-defer-object--loaded');
			}

			function loadImages(deferredImage) {
				const src = deferredImage.getAttribute('data-src');

				if (!src) {
					return;
				}
				deferredImage.classList.add('t-lazy-load-image');
				deferredImage.src = src;
			}

		}

		var observeDeferredTimeout;

		window.addEventListener('resize', function () {
			if (!observeDeferredTimeout) {
				observeDeferredTimeout = setTimeout(function () {
					observeDeferredTimeout = null;

					observeDeferred();
				}, 100);
			}
		}, false);
		observeDeferred();


		/**
		 * Load and initialize the Custom Select extension
		 */
		$.loadScript(theme_path + 'extensions/custom-elements/selects/custom-select.js');


	},
	jsSFNT: function() {
		/**
		 * Create promo image text overlays for every `storefront-promo__item`
		 */
		(function () {
			'use strict';

			let promoItems = document.querySelectorAll('[data-hook="storefront-promo__item"]');

			for (let id = 0; id < promoItems.length; id++) {
				let promoCaption = document.createElement('figcaption');
				let promoImage = promoItems[id].querySelector('img');
				let promoImageAlt = promoImage.getAttribute('alt');
				let promoLink = promoItems[id].querySelector('a');

				promoCaption.classList.add('t-storefront-promo__caption');
				promoCaption.textContent = promoImageAlt;

				if (promoLink) {
					promoLink.append(promoCaption);
				}
				else {
					promoItems[id].append(promoCaption);
				}
			}
		})();


		/**
		 * Create spotlight image text overlays for every `spotlight__figure`
		 */
		(function () {
			'use strict';

			let spotlightItems = document.querySelectorAll('[data-hook="spotlight__figure"]');

			for (let id = 0; id < spotlightItems.length; id++) {
				let spotlightCaption = document.createElement('figcaption');
				let spotlightImage = spotlightItems[id].querySelector('img');
				let spotlightImageAlt = spotlightImage.getAttribute('alt');
				let spotlightLink = spotlightItems[id].querySelector('a');

				spotlightCaption.classList.add('t-spotlight__figure-text');
				spotlightCaption.textContent = spotlightImageAlt;

				if (spotlightLink) {
					spotlightLink.append(spotlightCaption);
				}
				else {
					spotlightItems[id].append(spotlightCaption);
				}
			}
		})();


		/**
		 * Load and initialize the Slick plugin for Featured Products
		 */
		$.loadScript(theme_path + 'plugins/slick/slick.min.js', function () {
			$.hook('featured-products').slick({
				draggable: false,
				infinite: false,
				slidesToScroll: 5,
				slidesToShow: 5,
				responsive: [
					{
						breakpoint: 1200,
						settings: {
							slidesToScroll: 4,
							slidesToShow: 4
						}
					},
					{
						breakpoint: 960,
						settings: {
							slidesToScroll: 3,
							slidesToShow: 3
						}
					},
					{
						breakpoint: 748,
						settings: {
							slidesToScroll: 2,
							slidesToShow: 2
						}
					},
					{
						breakpoint: 360,
						settings: {
							slidesToScroll: 1,
							slidesToShow: 1
						}
					}
				]
			});
		});
	},
	jsCTGY: function() {
		var subcategoryNavigation = document.querySelector('[data-hook="subcategory-navigation"]');
		var subcategoryNavigationBlock = $.hook('subcategory-navigation-block');
		var subcategoryNavigationSlider = $.hook('subcategory-navigation-slider');

		function loadSubcategoryNavigation() {
			subcategoryNavigationBlock.css('visibility', 'hidden');
			if (/**document.body.clientWidth >= 960 &&*/ subcategoryNavigationSlider.html() === '') {
				subcategoryNavigationSlider.append(document.importNode(subcategoryNavigation.getTemplateContent(), true));

				$.loadScript(theme_path + 'plugins/slick/slick.min.js', function () {
					subcategoryNavigationSlider.slick({
						draggable: false,
						infinite: false,
						slidesToScroll: 8,
						slidesToShow: 8,
						responsive: [
							{
								breakpoint: 1200,
								settings: {
									slidesToScroll: 6,
									slidesToShow: 6
								}
							},
							{
								breakpoint: 960,
								settings: {
									slidesToScroll: 4,
									slidesToShow: 4
								}
							},
							{
								breakpoint: 959,
								//settings: 'unslick'
								settings: {
									slidesToScroll: 2,
									slidesToShow: 2
								}
							}
						]
					});
				});

				subcategoryNavigationSlider.on('destroy', function () {
					subcategoryNavigationSlider.empty();
				});

				subcategoryNavigationBlock.css('visibility', 'visible');
			}
			subcategoryNavigationBlock.css('visibility', 'visible');
		}


		/**
		 * Load and initialize the Refinery extension
		 */
		var facetsContainer = $.hook('add-refinery');
		var facetTemplate = document.querySelector('[data-hook="horizontal-refinery"]');

		if (facetTemplate !== null) {
			var facetTemplateContent = facetTemplate.getTemplateContent();
		}

		var hasRefinery = $.hook('refinery');
		var hasRefineryAnnex = $.hook('refinery-annex');

		function loadRefinery() {
			facetsContainer.css('visibility', 'hidden');
			if (document.body.clientWidth >= 959 && facetsContainer.html() === '') {
				facetsContainer.append(document.importNode(facetTemplateContent, true));
				facetsContainer.css('visibility', 'visible');
			}
			else if (document.body.clientWidth < 959) {
				facetsContainer.empty();
			}
			$.loadScript(theme_path + 'extensions/facets/refinery/refinery.js');

		}

		var loadSubcategoryTimeout;
		var loadRefineryTimeout;

		window.addEventListener('resize', function () {
			if (!loadSubcategoryTimeout) {
				loadSubcategoryTimeout = setTimeout(function () {
					loadSubcategoryTimeout = null;

					subcategoryNavigationBlock.css('visibility', 'hidden');
					loadSubcategoryNavigation();
				}, 100);
			}
		}, false);
		window.addEventListener('resize', function () {
			if (!loadRefineryTimeout) {
				loadRefineryTimeout = setTimeout(function () {
					loadRefineryTimeout = null;

					if (hasRefinery) {
						facetsContainer.css('visibility', 'hidden');
						loadRefinery();
					}
				}, 100);
			}
		}, false);
		loadSubcategoryNavigation();

		if (hasRefinery || hasRefineryAnnex) {
			loadRefinery();
		}

		/**
		 * Accordion Extension
		 */
		(function () {
			'use strict';

			let accordionToggles = document.querySelectorAll('[data-hook="accordion-toggle"]');

			for (let id = 0; id < accordionToggles.length; id++) {
				accordionToggles[id].addEventListener('click', function (event) {
					let parent = this.parentElement.closest('li');

					parent.classList.toggle('is-active');
				});
			}
		})();


		/**
		 * Sub-Subcategory/Product Slider
		 */
		var subcategoryProductList = $.hook('subcategory-product-list');

		if (subcategoryProductList.length > 0) {
			$.loadScript(theme_path + 'plugins/slick/slick.min.js', function () {
				subcategoryProductList.each(function () {
					var header = $(this).prev($.hook('subcategory-product-list__heading'));

					$(this).slick({
						appendArrows: header,
						draggable: false,
						infinite: false,
						slidesToScroll: 4,
						slidesToShow: 4,
						responsive: [
							{
								breakpoint: 768,
								settings: {
									appendArrows: header,
									slidesToScroll: 2,
									slidesToShow: 2
								}
							},
							{
								breakpoint: 640,
								settings: {
									appendArrows: $(this),
									slidesToScroll: 2,
									slidesToShow: 2
								}
							}
						]
					});
				});
			});

		}


	},
	jsCTLG: function() {
		themeFunctionality.jsCTGY();
	},
	jsPROD: function() {
		/**
		 * This function set will update an attributes label when choosing an option from a radio or select element.
		 */
		(function () {
			'use strict';

			let updateSelection = document.querySelectorAll('[data-hook="update-selection"]');

			for (let id = 0; id < updateSelection.length; id++) {
				let updateSelectionLabel = updateSelection[id].querySelector('[data-hook="update-selection-label"]');
				let updateRadio = updateSelection[id].querySelectorAll('input[type="radio"]');
				let updateSelect = updateSelection[id].querySelectorAll('select');

				if (updateRadio.length > 0) {
					for (let radioID = 0; radioID < updateRadio.length; radioID++) {
						if (updateRadio[radioID].checked) {
							updateSelectionLabel.textContent = updateRadio[radioID].value;
						}

						updateRadio[radioID].addEventListener('change', function (event) {
							updateSelectionLabel.textContent = this.value;
						});
					}
				}
				if (updateSelect.length > 0) {
					for (let selectID = 0; selectID < updateSelect.length; selectID++) {
						updateSelectionLabel.textContent = updateSelect[selectID].options[updateSelect[selectID].selectedIndex].text;

						updateSelect[selectID].addEventListener('change', function (event) {
							updateSelectionLabel.textContent = this.options[this.selectedIndex].text;
						});
					}
				}

			}
		})();

		/**
		 * This function toggles the radio when selecting a subscription term.
		 */
		let canSubscribe = document.querySelector('[data-hook="select-subscription"]');

		if (canSubscribe) {
			canSubscribe.addEventListener('click', function (event) {
				if (event.target !== event.currentTarget) {
					event.currentTarget.click();
				}
			});
		}

		/**
		 * Product Imagery
		 * This set of functions control the creation and operation of the product image gallery carousels.
		 */
		let productThumbnails = document.querySelector('[data-hook="product-thumbnails"]');
		let debouncedThumbnailSlider = $.debounced(function () {
			if ($(productThumbnails).hasClass('slick-initialized')) {
				$(productThumbnails).css('opacity', 0).removeClass('slick-slider slick-vertical slick-initialized');
			}

			$(productThumbnails).on('init', function (event, slick) {
				$(event.target).css('opacity', 0);
				setTimeout(function () {
					$(event.target).css('opacity', 1);
				}, 50);
			});

			$(productThumbnails).not('.slick-initialized').slick({
				draggable: false,
				infinite: false,
				slidesToScroll: 5,
				slidesToShow: 5,
				vertical: true,
				verticalSwiping: true,
				responsive: [
					{
						breakpoint: 768,
						settings: {
							slidesToScroll: 4,
							slidesToShow: 4,
							vertical: false,
							verticalSwiping: false
						}
					}
				]
			});
		}, 250);


		/**
		 * Update Display When Attribute Machine Fires
		 */
		MivaEvents.SubscribeToEvent('variant_changed', function () {
		});

		if (productThumbnails.innerHTML !== '') {
			$.loadScript(theme_path + 'plugins/slick/slick.min.js', debouncedThumbnailSlider);
			$(document).on('ImageMachine_Generate_Thumbnail', debouncedThumbnailSlider);
		}

		let productImage = $.hook('product-image');

		if (productImage.length > 0) {
			$.loadScript(theme_path + 'plugins/slick/slick.min.js', function () {
				$.hook('product-image').on('click', function (event) {
					let goTo = this.getAttribute('data-index');
					let activePhotoGallery = $.hook('active-main_image').find($.hook('photo-gallery'));

					activePhotoGallery.slick({
						draggable: false,
						infinite: false,
						slidesToScroll: 1,
						slidesToShow: 1
					});
					activePhotoGallery.slick('slickGoTo', goTo, true);
				});
			});
		}


		/**
		 * Load and initialize the AJAX Add to Cart extension
		 */
		$.loadScript(theme_path + 'extensions/product-layout/ajax-add-to-cart.js');


		/**
		 * Load and initialize the Slick plugin for Related Products
		 */
		let relatedProductList = $.hook('related-products');

		if (relatedProductList.length > 0) {
			$.loadScript(theme_path + 'plugins/slick/slick.min.js', function () {
				relatedProductList.each(function () {
					var header = $(this).prev($.hook('related-product-list__heading'));

					$(this).slick({
						appendArrows: header,
						draggable: false,
						infinite: false,
						slidesToScroll: 5,
						slidesToShow: 5,
						responsive: [
							{
								breakpoint: 1200,
								settings: {
									appendArrows: header,
									slidesToScroll: 4,
									slidesToShow: 4
								}
							},
							{
								breakpoint: 960,
								settings: {
									appendArrows: header,
									slidesToScroll: 3,
									slidesToShow: 3
								}
							},
							{
								breakpoint: 768,
								settings: {
									appendArrows: header,
									slidesToScroll: 2,
									slidesToShow: 2
								}
							},
							{
								breakpoint: 640,
								settings: {
									appendArrows: $(this),
									slidesToScroll: 1,
									slidesToShow: 1
								}
							}
						]
					});
				});
			});
		}


		/**
		 * This is the Show/Hide functionality for the Show More links in the
		 * product description section.
		 */
		(function () {
			'use strict';

			function vw(v) {
				let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
				return (v * w) / 100;
			}

			let showMoreSections = document.querySelectorAll('[data-hook="show-more"]');

			function peekaboo (reset) {
				if (showMoreSections.length > 0) {
					if (reset) {
						document.querySelectorAll('[data-hook="show-more-toggle"]').forEach(function (toggle) {
							toggle.parentNode.removeChild(toggle);
						});
						return;
					}

					showMoreSections.forEach(function (showMore) {
						if (showMore.clientHeight > vw(30)) {
							let showMoreToggle = document.createElement('button');
							let showContent = '<span class="t-show-more__toggle-text">See More <span class="u-icon-chevron-down u-font-small"></span></span>';
							let lessContent = '<span class="t-show-more__toggle-text">See Less <span class="u-icon-chevron-up u-font-small"></span></span>';

							showMoreToggle.innerHTML = showContent;
							showMoreToggle.classList.add('t-show-more__toggle');
							showMoreToggle.setAttribute('data-hook', 'show-more-toggle');
							showMore.classList.add('t-show-more');
							showMore.appendChild(showMoreToggle);

							showMoreToggle.addEventListener('click', function (clickEvent) {
								clickEvent.preventDefault();
								showMore.classList.toggle('t-show-more--active');
								if (showMoreToggle.innerHTML === showContent) {
									showMoreToggle.innerHTML = lessContent;
								}
								else {
									showMoreToggle.innerHTML = showContent;
								}
							});
						}

					});
				}
			}
			peekaboo();

			let peekabooTimeout;

			window.addEventListener('resize', function () {
				peekaboo(true);
				if (peekabooTimeout) {
					window.cancelAnimationFrame(peekabooTimeout);
				}

				peekabooTimeout = window.requestAnimationFrame(function () {
					peekaboo();
				});
			}, false);

		}());

	},
	jsPATR: function() {
		/**
		 * This function set will update an attributes label when choosing an option from a radio or select element.
		 */
		(function () {
			'use strict';

			let updateSelection = document.querySelectorAll('[data-hook="update-selection"]');

			for (let id = 0; id < updateSelection.length; id++) {
				let updateSelectionLabel = updateSelection[id].querySelector('[data-hook="update-selection-label"]');
				let updateRadio = updateSelection[id].querySelectorAll('input[type="radio"]');
				let updateSelect = updateSelection[id].querySelectorAll('select');

				if (updateRadio.length > 0) {
					for (let radioID = 0; radioID < updateRadio.length; radioID++) {
						if (updateRadio[radioID].checked) {
							updateSelectionLabel.textContent = updateRadio[radioID].value;
						}

						updateRadio[radioID].addEventListener('change', function (event) {
							updateSelectionLabel.textContent = this.value;
						});
					}
				}
				if (updateSelect.length > 0) {
					for (let selectID = 0; selectID < updateSelect.length; selectID++) {
						updateSelectionLabel.textContent = updateSelect[selectID].options[updateSelect[selectID].selectedIndex].text;

						updateSelect[selectID].addEventListener('change', function (event) {
							updateSelectionLabel.textContent = this.options[this.selectedIndex].text;
						});
					}
				}

			}
		})();

		let canSubscribe = document.querySelector('[data-hook="select-subscription"]');

		if (canSubscribe) {
			canSubscribe.addEventListener('click', function (event) {
				if (event.target !== event.currentTarget) {
					event.currentTarget.click();
				}
			});
		}
	},
	jsPLST: function() {
		themeFunctionality.jsCTGY();
	},
	jsSRCH: function() {
		themeFunctionality.jsCTGY();
	},
	jsBASK: function() {
		/**
		 * Load and initialize the Quantify extension
		 */
		$.loadScript(theme_path + 'extensions/quantify/quantify.js');

		/**
		 * Enable the shipping estimate functionality.
		 */
		mivaJS.estimateShipping('basket');
	},
	jsORDL: function() {
	},
	jsOCST: function() {
	},
	jsOSEL: function() {
	},
	jsOPAY: function() {
	},
	jsINVC: function() {
	},
	jsACLN: function() {
		/**
		 * This set of functions makes for a better overflow scrolling navigation section.
		 * @type {Element}
		 */
		const $navList = document.querySelector('[data-hook="account-navigation__list"]');
		const $shadowStart = document.querySelector('[data-hook="account-navigation__shadow--start"]');
		const $shadowEnd = document.querySelector('[data-hook="account-navigation__shadow--end"]');

		function handleShadowVisibility() {
			const maxScrollStartReached = $navList.scrollLeft <= 0;
			const maxScrollEndReached = $navList.scrollLeft >= $navList.scrollWidth - $navList.offsetWidth;

			toggleShadow($shadowStart, maxScrollStartReached);
			toggleShadow($shadowEnd, maxScrollEndReached);
		}

		function toggleShadow($el, maxScrollReached) {
			const shadowIsVisible = $el.classList.contains('is-visible');
			const showShadow = !maxScrollReached && !shadowIsVisible;
			const hideShadow = maxScrollReached && shadowIsVisible;

			if (showShadow) {
				window.requestAnimationFrame(function () {
					$el.classList.add('is-visible');
				});
			}
			else if (hideShadow) {
				window.requestAnimationFrame(function () {
					$el.classList.remove('is-visible');
				});
			}
		}

		if ($navList !== null) {
			$navList.addEventListener('scroll', function (scrollEvent) {
				handleShadowVisibility(scrollEvent);
			});

			handleShadowVisibility();
		}

	},
	jsABAL: function() {
		themeFunctionality.jsACLN();
	},
	jsACRT: function() {
		themeFunctionality.jsACLN();
	},
	jsCABK: function() {
		themeFunctionality.jsACLN();
	},
	jsCADA: function() {
		themeFunctionality.jsACLN();
	},
	jsCADE: function() {
		themeFunctionality.jsACLN();
	},
	jsCEML: function() {
		themeFunctionality.jsACLN();
	},
	jsCPCA: function() {
		themeFunctionality.jsACLN();
	},
	jsCPCD: function() {
		themeFunctionality.jsACLN();
	},
	jsCPCE: function() {
		themeFunctionality.jsACLN();
	},
	jsCPRO: function() {
		themeFunctionality.jsACLN();
	},
	jsCPWD: function() {
		themeFunctionality.jsACLN();
	},
	jsCSBE: function() {
		themeFunctionality.jsACLN();
	},
	jsCSTR: function() {
		themeFunctionality.jsACLN();
	},
	jsCSUB: function() {
		themeFunctionality.jsACLN();
	},
	jsORDH: function() {
		themeFunctionality.jsACLN();
	},
	jsORDS: function() {
		themeFunctionality.jsACLN();
	},
	jsRGFT: function() {
		themeFunctionality.jsACLN();
	},
	jsWISH: function() {
		themeFunctionality.jsACLN();
	},
	jsWLAD: function() {
		themeFunctionality.jsACLN();
	},
	jsWLED: function() {
		themeFunctionality.jsACLN();
	},
	jsWLST: function() {
		themeFunctionality.jsACLN();
	},
	jsWPCK: function() {
		themeFunctionality.jsACLN();
	}
};
