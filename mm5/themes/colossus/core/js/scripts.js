/**
 * Check if Cash has been replaced by jQuery. If it has not, set jQuery
 * as a `window` element.
 */
if (typeof jQuery === 'undefined') {
	window.jQuery = cash = $;
}


(function (mivaJS) {}(window.mivaJS || (window.mivaJS = {})));

/**
 *    Cash/jQuery Extensions
 */
$.extend({
	debounced: function (fn, timeout, invokeAsap, ctx) {
		/**
		 * Custom function to allow us to delay events until after the
		 * trigger has ended.
		 *
		 * Example: $(window).on('resize', $.debounced(function () {...DO SOMETHING...}, 100));
		 */
		if (arguments.length === 3 && typeof invokeAsap !== 'boolean') {
			ctx = invokeAsap;
			invokeAsap = false;
		}
		var timer;

		return function () {
			var args = arguments;

			ctx = ctx || this;
			invokeAsap && !timer && fn.apply(ctx, args);
			clearTimeout(timer);
			timer = setTimeout(function () {
				invokeAsap || fn.apply(ctx, args);
				timer = null;
			}, timeout);
		};
	},
	hook: function (hookName) {
		/**
		 * Custom function to allow us to unify event triggers/binding
		 * using `data-` elements.
		 *
		 * Usage: $.hook('HOOK NAME')...
		 * Example: $.hook('open-menu').on('click', function (e) {e.preventDefault(); ELEMENT.show();});
		 */
		var selector;

		if (!hookName || hookName === '*') {
			// select all data-hooks
			selector = '[data-hook]';
		}
		else {
			// select specific data-hook
			selector = '[data-hook~="' + hookName + '"]';
		}
		return $(selector);
	},
	loadScript: function (url, callback) {
		/**
		 * Loads a JavaScript file asynchronously with a callback, like
		 * jQuery's `$.getScript()` except without jQuery.
		 *
		 * Usage:
		 * $.loadScript(FILE_PATH, function () {
		 * 		DO SOMETHING...
		 * });
		 */
		var head = document.getElementsByTagName('head')[0];
		var scriptCalled = document.createElement('script');

		scriptCalled.async = true;
		scriptCalled.src = url;
		scriptCalled.onload = scriptCalled.onreadystatechange = function () {
			if (!scriptCalled.readyState || /loaded|complete/.test(scriptCalled.readyState)) {
				scriptCalled.onload = scriptCalled.onreadystatechange = null;

				if (head && scriptCalled.parentNode) {
					head.removeChild(scriptCalled)
				}

				scriptCalled = undefined;

				if (callback) {
					callback();
				}
			}
		};
		//head.insertBefore(scriptCalled, head.firstChild);
		head.appendChild(scriptCalled)
	}
});


/**
 *    HTML Class Name
 *    This function will check if JavaScript is enabled, detect touch and hover
 *    capabilities, and modify the class list as needed.
 */
(function () {
	'use strict';

	var html = document.documentElement;

	html.classList.remove('no-js');
	html.classList.add('js');

	/**
	 * Detect if the user is utilizing a touch interface.
	 */
	window.addEventListener('touchstart', function onFirstTouch() {
		html.classList.add('touch');
		html.setAttribute('data-touch', '');
		window.USER_IS_TOUCHING = true;
		sessionStorage.setItem('USER_IS_TOUCHING', true);
		window.USER_CAN_HOVER = false;
		sessionStorage.setItem('USER_CAN_HOVER', false);
		window.removeEventListener('touchstart', onFirstTouch, false);
	}, false);

	/**
	 * Detect if the user can hover over elements.
	 */
	window.addEventListener('mouseover', function onFirstHover() {
		window.USER_CAN_HOVER = true;
		sessionStorage.setItem('USER_CAN_HOVER', true);
		html.classList.remove('touch');
		html.removeAttribute('data-touch');
		window.USER_IS_TOUCHING = false;
		sessionStorage.setItem('USER_IS_TOUCHING', false);
		window.removeEventListener('mouseover', onFirstHover, false);
	}, false);
}());


/**
 * Breakpoints
 * This function will retrieve the breakpoint value set via CSS. You can use
 * this to trigger a function based on the predefined breakpoints rather than
 * a randomly chosen one.
 *
 * Usage:
 * if (breakpoint === 'medium') {
 *     yourFunctionCall();
 * }
 */
// Setup the breakpoint variable
var breakpoint;

// Get the current breakpoint
var getBreakpoint = function () {
	return window.getComputedStyle(document.body, '::before').content.replace(/\"/g, '');
};

// Setup a timer
var timeout;

// Calculate breakpoint on page load
breakpoint = getBreakpoint();

// Listen for resize events
window.addEventListener('resize', function (event) {
	// If there's a timer, cancel it
	if (timeout) {
		window.cancelAnimationFrame(timeout);
	}

	// Setup the new requestAnimationFrame()
	timeout = window.requestAnimationFrame(function () {
		breakpoint = getBreakpoint();
	});

}, false);


/**
 * CSS Feature Detect - Used in place of Modernizr
 * Returns true or false depending on your browser. Let's hope it's true.
 * NOTE: This may be removed in future versions of the framework as
 * browser compatibility and support changes.
 *
 * Usage: detectCSSFeature('transition');
 */
function detectCSSFeature(featureName) {
	'use strict';

	var feature = false,
		domPrefixes = 'Moz ms Webkit'.split(' '),
		elm = document.createElement('div'),
		featureNameCapital = null;

	featureName = featureName.toLowerCase();
	if (elm.style[featureName] !== undefined) {
		feature = true;
	}
	if (feature === false) {
		featureNameCapital = featureName.charAt(0).toUpperCase() + featureName.substr(1);
		for (var i = 0; i < domPrefixes.length; i++) {
			if (elm.style[domPrefixes[i] + featureNameCapital] !== undefined) {
				feature = true;
				break;
			}
		}
	}
	return feature;
}


/**
 * A complete cookies reader/writer framework with full unicode support.
 *
 * Revision #1 - September 4, 2014
 * https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework
 * https://developer.mozilla.org/User:fusionchess
 * https://github.com/madmurphy/cookies.js
 *
 * This framework is released under the GNU Public License, version 3 or later.
 * http://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * Syntax:
 * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]]);
 * docCookies.getItem(name);
 * docCookies.removeItem(name[, path[, domain]]);
 * docCookies.hasItem(name);
 * docCookies.keys();
 */
var docCookies = {
	getItem: function (sKey) {
		if (!sKey) {
			return null;
		}
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
			return false;
		}
		var sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toUTCString();
					break;
			}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
		return true;
	},
	removeItem: function (sKey, sPath, sDomain) {
		if (!this.hasItem(sKey)) {
			return false;
		}
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
		return true;
	},
	hasItem: function (sKey) {
		if (!sKey) {
			return false;
		}
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys: function () {
		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
			aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
		}
		return aKeys;
	}
};


var elementsUI = {
	site: function () {
		/**
		 * Load the `polyfills.js` file and initialise functions.
		 * NOTE: This may be removed in future versions of the framework as
		 * browser compatibility and support changes.
		 */
		if (!window.CSS || !window.CSS.supports('(--foo: red)')) {
			$.loadScript(theme_path + 'core/js/polyfills.js', function () {
				sessionStorage.setItem('outdated', true);
				cssCapabilities.init();
			});
		}


		/**
		 * Load the `mini-modal.js` file and initialize functions if modal elements exist.
		 * This is the default set of modal/light box functionality supplied with the framework.
		 */
		var targets = document.querySelectorAll('[data-mini-modal]');

		if (targets.length) {
			$.loadScript(theme_path + 'core/js/mini-modal.js', function () {
				for (var i = 0; i < targets.length; i += 1) {
					var modal = minimodal(targets[i], {
						// If you would like a global onLoaded callback, add your function here
						//onLoaded: function () {},
						// If you would like a global onClosed callback, add your function here
						//onClosed: function () {},
						// If you are using, and have, a Google Maps API Key, enter it here.
						googleMapsAPIKey: ''
					});

					if (!targets[i].id) {
						targets[i].id = 'miniModal_' + i;
					}
					modal.init();
				}
			});
		}


		/**
		 * Although NodeList is not an Array, it is possible to iterate on it using forEach().
		 * It can also be converted to an Array using Array.from().
		 * However some older browsers have not yet implemented NodeList.forEach() nor Array.from().
		 * But those limitations can be circumvented by using Array.prototype.forEach().
		 * This polyfill adds compatibility to browsers which do not support NodeList.forEach(). [IE11]
		 */
		if (window.NodeList && !NodeList.prototype.forEach) {
			NodeList.prototype.forEach = function (callback, thisArg) {
				thisArg = thisArg || window;
				for (var i = 0; i < this.length; i++) {
					callback.call(thisArg, this[i], i, this);
				}
			};
		}

	},

	pages: {
		/* ----------
		 Common :
		 ---------- */
		common: function () {
			/**
			 * Add `ID` and `CLASS` attributes to `INPUT` and `SELECT` elements
			 * dynamically created by Miva.
			 */
			var mvtInputWraps = document.querySelectorAll('[data-hook~="mvt-input"]');
			var mvtSelectWraps = document.querySelectorAll('[data-hook~="mvt-select"]');

			mvtInputWraps.forEach(function (element) {
				var classes = element.getAttribute('data-classlist');
				var id = element.getAttribute('data-id');
				var mvtInputs = element.querySelectorAll('input');

				mvtInputs.forEach(function (mvtInput) {
					if (mvtInput.getAttribute('type') !== 'hidden') {
						mvtInput.setAttribute('class', classes);
						mvtInput.setAttribute('id', id);
					}
				});
			});

			mvtSelectWraps.forEach(function (element) {
				var classes = element.getAttribute('data-classlist');
				var id = element.getAttribute('data-id');
				var mvtSelects = element.querySelectorAll('select');

				mvtSelects.forEach(function (mvtSelect) {
					mvtSelect.setAttribute('class', classes);
					mvtSelect.setAttribute('id', id);
				});
			});

		},

		jsSFNT: function () {
		},

		jsCTGY: function () {
		},

		jsPROD: function () {
			/**
			 * This removes the default Miva `closeup_backing` container.
			 */
			var closeupBacking = document.querySelector('div.closeup_backing');

			window.addEventListener('load', function () {
				if (closeupBacking) {
					closeupBacking.parentNode.removeChild(document.querySelector('div.closeup_backing'));
				}
			});

		},

		jsPATR: function () {
		},

		jsBASK: function () {
			/**
			 * Estimate Shipping
			 */
			mivaJS.estimateShipping = function (element) {
				'use strict';

				var currentModal = document.querySelector('[data-hook="' + element + '"]');
				var formElement = currentModal.querySelector('[data-hook="shipping-estimate-form"]');
				var formButton = formElement.querySelector('[data-hook="calculate-shipping-estimate"]');

				function createCalculation () {
					var processor = document.createElement('iframe');

					processor.id = 'calculate-shipping';
					processor.name = 'calculate-shipping';
					processor.style.display = 'none';
					formElement.before(processor);
					processor.addEventListener('load', function () {
						displayResults(processor);
					});
					formElement.submit();
				}

				function displayResults (source) {
					var content = source.contentWindow.document.body.innerHTML;

					formElement.querySelector('[data-hook="shipping-estimate-fields"]').classList.add('u-hidden');
					formElement.querySelector('[data-hook="shipping-estimate-results"]').innerHTML = content;
					formElement.setAttribute('data-status', 'idle');

					formElement.querySelector('[data-hook="shipping-estimate-recalculate"]').addEventListener('click', function () {
						formElement.querySelector('[data-hook="shipping-estimate-results"]').innerHTML = '';
						formElement.querySelector('[data-hook="shipping-estimate-fields"]').classList.remove('u-hidden');
					});

					setTimeout(
						function () {
							source.parentNode.removeChild(source);
						}, 1
					);
				}

				formButton.addEventListener('click', function (event) {
					event.preventDefault();
					createCalculation();
				}, false);
			};

		},

		jsORDL: function () {
		},

		jsOCST: function () {
			/**
			 * Use AJAX for coupon form to prevent page refresh.
			 * https://github.com/mivaecommerce/readytheme-shadows/issues/54
			 */
			(function (document) {
				'use strict';

				document.addEventListener('click', function (evt) {
					var submitButton = document.querySelector('[data-hook="basket__coupon-form-submit"]');
					var submitButtonText = ((submitButton.nodeName.toLowerCase() === 'input') ? submitButton.value : submitButton.textContent);
					var ajaxForm = document.querySelector('[data-hook="basket__coupon-form"]');

					if (evt.target.matches('[data-hook="basket__coupon-form-submit"]')) {
						evt.preventDefault();
						evt.stopImmediatePropagation();

						var data = new FormData(ajaxForm);
						var request = new XMLHttpRequest(); // Set up our HTTP request

						ajaxForm.setAttribute('data-status', 'idle');

						if (ajaxForm.getAttribute('data-status') !== 'submitting') {
							ajaxForm.setAttribute('data-status', 'submitting');
							submitButton.setAttribute('disabled', 'disabled');

							if (submitButton.nodeName.toLowerCase() === 'input') {
								submitButton.value = 'Processing...';
							}
							else {
								submitButton.textContent = 'Processing...';
							}

							document.querySelector('#messages').parentNode.removeChild(document.querySelector('#messages'));

							// Setup our listener to process completed requests
							request.onreadystatechange = function () {
								// Only run if the request is complete
								if (request.readyState !== 4) {
									return;
								}

								// Process our return data
								if (request.status === 200) {
									// What do when the request is successful
									var response = request.response;
									var basketSummary = response.querySelector('#checkout_basket_summary');
									var responseMessage = response.querySelector('#messages');

									response.querySelector('[data-hook="basket__coupon-form"]').parentElement.prepend(responseMessage);
									document.querySelector('#checkout_basket_summary').innerHTML = basketSummary.innerHTML;


									// Reset button text and form status
									submitButton.removeAttribute('disabled');

									if (submitButton.nodeName.toLowerCase() === 'input') {
										submitButton.value = submitButtonText;
									}
									else {
										submitButton.textContent = submitButtonText;
									}

									ajaxForm.setAttribute('data-status', 'idle');
								}
								else {
									// What do when the request fails
									console.warn('The request failed!');
									ajaxForm.setAttribute('data-status', 'idle');
								}
							};

							/**
							 * Create and send a request
							 * The first argument is the post type (GET, POST, PUT, DELETE, etc.)
							 * The second argument is the endpoint URL
							 */
							request.open(ajaxForm.method, ajaxForm.action, true);
							request.responseType = 'document';
							request.send(data);
						}
					}
				}, false);

			}(document));

		},

		jsOSEL: function () {
		},

		jsOPAY: function () {
			/**
			 * Credit Card Detection
			 */
			$.loadScript(theme_path + 'core/js/payment-method.js', function () {
				$.hook('detect-card').on('input paste', function () {
					var cardInput = this;

					if (isNaN(this.value)) {
						this.classList.add('has-error');
					}
					paymentMethod(this, function (paymentDetected) {
						if (paymentDetected) {
							cardInput.classList.remove('has-error');
							$.hook('payment-method-display').text(paymentDetected.display);
							$.hook('payment-method').val(supportedPaymentMethods.findPaymentMethod(paymentDetected.name));
						}
					});
				});
			});

			/**
			 * Added functionality to help style the default Miva output payment
			 * fields.
			 */
			$.hook('mvt-input').each(function () {
				var dataHook = $(this).attr('data-datahook');

				if (dataHook) {
					$(this).find('input').attr('data-hook', dataHook);
				}

				Array.prototype.forEach.call($(this), function (el) {
					el.innerHTML = el.innerHTML.replace(/&nbsp;/gi, '');
				});
			});

			$.hook('detect-card').attr('type', 'tel');

			$('[data-id="cvv"]').find('input').attr('type', 'tel');

			$.hook('mvt-select').find('select').each(function () {
				var wrapDiv = document.createElement('div'),
					select = this;

				wrapDiv.classList.add('c-form-select');
				select.parentNode.insertBefore(wrapDiv, select);
				wrapDiv.appendChild(select);
			});

		},

		jsINVC: function () {
			/**
			 *  Launch Printer Dialog
			 */
			$.hook('print-invoice').on('click', function (element) {
				element.preventDefault();
				window.print();
			});
		},

		jsORDS: function () {
			/**
			 *  Launch Printer Dialog
			 */
			$.hook('print-invoice').on('click', function (element) {
				element.preventDefault();
				window.print();
			});
		},

		jsLOGN: function () {
		},

		jsACAD: function () {
		},

		jsACED: function () {
		},

		jsCABK: function () {
		},

		jsCADA: function () {
		},

		jsCADE: function () {
		},

		jsAFCL: function () {
		},

		jsAFAD: function () {
		},

		jsAFED: function () {
		},

		jsORHL: function () {
		},

		jsCTUS: function () {
		}
	},

	theme: function (pageID) {
		/**
		 * Call in additional functions as developed for theme.
		 */
		$.loadScript(theme_path + 'ui/js/theme.js', function () {
			window.addEventListener('load',
				$.debounced(function () {
					themeFunctionality.init();

					if (themeFunctionality[pageID]) {
						themeFunctionality[pageID]();
					}
				}, 300),
				false
			);
		});
	}
};


(function () {
	String.prototype.toCamelCase = function (cap1st) {
		'use strict';

		return ((cap1st ? '-' : '') + this).replace(/-+([^-])/g, function (a, b) {
			return b.toUpperCase();
		});
	};
	var pageID = document.body.id.toCamelCase();

	/**
	 * Initialize Global Site Functions
	 */
	elementsUI.site();

	/**
	 * Initialize Common Page Functions
	 */
	elementsUI.pages.common();

	/**
	 * Initialize Page Specific Functions
	 */
	if (elementsUI.pages[pageID]) {
		elementsUI.pages[pageID]();
	}

	/**
	 * Initialize Theme Specific Function
	 */
	elementsUI.theme(pageID);
}());
