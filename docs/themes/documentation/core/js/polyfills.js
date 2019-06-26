
var cssCapabilities = {
	init: function init() {
		'use strict';

		/**
		 * First we will check if the browser supports CSS Variables.
		 * No version of IE supports window.CSS.supports, so if that is not
		 * supported in the first place we know CSS Variables are not supported.
		 * Edge supports `supports`, so check for actual variable support.
		 * CSS Variable support has been added in Edge 15.
		 */

		//if (sessionStorage.getItem('outdated') && sessionStorage.getItem('outdated') === 'true') {
			//console.warn('Your browser does not support CSS Variables. :-(');
		//}
		//else {
			//console.log('Your browser supports CSS Variables!');
			//return;
		//}

		/**
		 * Start the fun.
		 */
		cssCapabilities.checkForIE();
		//cssCapabilities.updateCSS();
	},

	checkForIE: function checkForIE() {
		'use strict';

		/**
		 * Although we will support Internet Explorer 11 for the near future,
		 * we are still posting a notice that they should use a more up-to-date
		 * browser.
		 */
		if (document.documentMode && document.documentMode <= '11') {
			console.warn('Out Of Date Browser');

			var bodyElement = document.querySelector('body'),
				message = document.createElement('div'),
				messageContent = 'You are using an <strong>outdated</strong> browser.<br />Please <a href="//browsehappy.com/" target="_blank" rel="nofollow">upgrade your browser</a> to improve your experience.';

			document.documentElement.classList.add('ie' + document.documentMode);
			message.classList.add('x-messages');
			message.classList.add('x-messages--update-browser');
			message.classList.add('u-over-everything');
			message.classList.add('x-messages--info');
			message.innerHTML = messageContent;
			bodyElement.insertBefore(message, bodyElement.firstChild);
		}
	},

	updateCSS: function updateCSS() {
		'use strict';

		if (!sessionStorage.getItem('cssFile')) {
			/**
			 * If the browser does not support the use of CSS Variables, replace the
			 * existing style sheet `link` with one which has been generated to
			 * remove unsupported references.
			 * @type {Element}
			 */
			var styleLink = document.querySelector('[data-stylesheet]'),
				cssFile = document.createElement('link');

			cssFile.setAttribute('href', theme_path + 'site-styles_compiled.css');
			cssFile.setAttribute('rel', 'stylesheet');
			sessionStorage.setItem('cssFile', theme_path + 'site-styles_compiled.css');

			styleLink.parentNode.insertBefore(cssFile, styleLink.nextSibling);

			cssFile.onload = function () {
				styleLink.parentNode.removeChild(styleLink);
				document.body.removeAttribute('data-outdated');
			};
		}
	}

};


/**
 * Lightweight ES6 Promise polyfill for the browser and node. A+ Compliant.
 * Adheres closely to the spec. It is a perfect polyfill IE, Firefox or any
 * other browser that does not support native promises.
 *
 * https://github.com/taylorhakes/promise-polyfill
 * License: MIT
 */
(function (root) {

	// Store setTimeout reference so promise-polyfill will be unaffected by
	// other code modifying setTimeout (like sinon.useFakeTimers())
	var setTimeoutFunc = setTimeout;

	function noop() {
	}

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
		return function () {
			fn.apply(thisArg, arguments);
		};
	}

	function Promise(fn) {
		if (typeof this !== 'object') {
			throw new TypeError('Promises must be constructed via new');
		}
		if (typeof fn !== 'function') {
			throw new TypeError('not a function');
		}
		this._state = 0;
		this._handled = false;
		this._value = undefined;
		this._deferreds = [];

		doResolve(fn, this);
	}

	function handle(self, deferred) {
		while (self._state === 3) {
			self = self._value;
		}
		if (self._state === 0) {
			self._deferreds.push(deferred);
			return;
		}
		self._handled = true;
		Promise._immediateFn(function () {
			var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
			if (cb === null) {
				(self._state === 1 ? resolve : reject)(deferred.promise, self._value);
				return;
			}
			var ret;
			try {
				ret = cb(self._value);
			}
			catch (e) {
				reject(deferred.promise, e);
				return;
			}
			resolve(deferred.promise, ret);
		});
	}

	function resolve(self, newValue) {
		try {
			// Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
			if (newValue === self) {
				throw new TypeError('A promise cannot be resolved with itself.');
			}
			if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
				var then = newValue.then;
				if (newValue instanceof Promise) {
					self._state = 3;
					self._value = newValue;
					finale(self);
					return;
				}
				else if (typeof then === 'function') {
					doResolve(bind(then, newValue), self);
					return;
				}
			}
			self._state = 1;
			self._value = newValue;
			finale(self);
		}
		catch (e) {
			reject(self, e);
		}
	}

	function reject(self, newValue) {
		self._state = 2;
		self._value = newValue;
		finale(self);
	}

	function finale(self) {
		if (self._state === 2 && self._deferreds.length === 0) {
			Promise._immediateFn(function () {
				if (!self._handled) {
					Promise._unhandledRejectionFn(self._value);
				}
			});
		}

		for (var i = 0, len = self._deferreds.length; i < len; i++) {
			handle(self, self._deferreds[i]);
		}
		self._deferreds = null;
	}

	function Handler(onFulfilled, onRejected, promise) {
		this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
		this.onRejected = typeof onRejected === 'function' ? onRejected : null;
		this.promise = promise;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, self) {
		var done = false;
		try {
			fn(function (value) {
				if (done) {
					return;
				}
				done = true;
				resolve(self, value);
			}, function (reason) {
				if (done) {
					return;
				}
				done = true;
				reject(self, reason);
			});
		}
		catch (ex) {
			if (done) {
				return;
			}
			done = true;
			reject(self, ex);
		}
	}

	Promise.prototype['catch'] = function (onRejected) {
		return this.then(null, onRejected);
	};

	Promise.prototype.then = function (onFulfilled, onRejected) {
		var prom = new (this.constructor)(noop);

		handle(this, new Handler(onFulfilled, onRejected, prom));
		return prom;
	};

	Promise.all = function (arr) {
		var args = Array.prototype.slice.call(arr);

		return new Promise(function (resolve, reject) {
			if (args.length === 0) {
				return resolve([]);
			}
			var remaining = args.length;

			function res(i, val) {
				try {
					if (val && (typeof val === 'object' || typeof val === 'function')) {
						var then = val.then;
						if (typeof then === 'function') {
							then.call(val, function (val) {
								res(i, val);
							}, reject);
							return;
						}
					}
					args[i] = val;
					if (--remaining === 0) {
						resolve(args);
					}
				}
				catch (ex) {
					reject(ex);
				}
			}

			for (var i = 0; i < args.length; i++) {
				res(i, args[i]);
			}
		});
	};

	Promise.resolve = function (value) {
		if (value && typeof value === 'object' && value.constructor === Promise) {
			return value;
		}

		return new Promise(function (resolve) {
			resolve(value);
		});
	};

	Promise.reject = function (value) {
		return new Promise(function (resolve, reject) {
			reject(value);
		});
	};

	Promise.race = function (values) {
		return new Promise(function (resolve, reject) {
			for (var i = 0, len = values.length; i < len; i++) {
				values[i].then(resolve, reject);
			}
		});
	};

	// Use polyfill for setImmediate for performance gains
	Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) {
			setImmediate(fn);
		}) ||
		function (fn) {
			setTimeoutFunc(fn, 0);
		};

	Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
		if (typeof console !== 'undefined' && console) {
			console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
		}
	};

	/**
	 * Set the immediate function to execute callbacks
	 * @param fn {function} Function to execute
	 * @deprecated
	 */
	Promise._setImmediateFn = function _setImmediateFn(fn) {
		Promise._immediateFn = fn;
	};

	/**
	 * Change the function to execute on unhandled rejection
	 * @param {function} fn Function to execute on unhandled rejection
	 * @deprecated
	 */
	Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
		Promise._unhandledRejectionFn = fn;
	};

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = Promise;
	}
	else if (!root.Promise) {
		root.Promise = Promise;
	}

})(this);
/**
 * To add to window
 */
if (!window.Promise) {
	window.Promise = Promise;
}


/**
 * The fetch() function is a Promise-based mechanism for programmatically making
 * web requests in the browser. This project is a polyfill that implements a
 * subset of the standard Fetch specification, enough to make fetch a viable
 * replacement for most uses of XMLHttpRequest in traditional web applications.
 */
(function (self) {
	'use strict';

	if (self.fetch) {
		return
	}

	var support = {
		searchParams: 'URLSearchParams' in self,
		iterable: 'Symbol' in self && 'iterator' in Symbol,
		blob: 'FileReader' in self && 'Blob' in self && (function () {
			try {
				new Blob();
				return true
			}
			catch (e) {
				return false
			}
		})(),
		formData: 'FormData' in self,
		arrayBuffer: 'ArrayBuffer' in self
	};

	if (support.arrayBuffer) {
		var viewClasses = [
			'[object Int8Array]',
			'[object Uint8Array]',
			'[object Uint8ClampedArray]',
			'[object Int16Array]',
			'[object Uint16Array]',
			'[object Int32Array]',
			'[object Uint32Array]',
			'[object Float32Array]',
			'[object Float64Array]'
		];

		var isDataView = function (obj) {
			return obj && DataView.prototype.isPrototypeOf(obj)
		};

		var isArrayBufferView = ArrayBuffer.isView || function (obj) {
				return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
			}
	}

	function normalizeName(name) {
		if (typeof name !== 'string') {
			name = String(name)
		}
		if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
			throw new TypeError('Invalid character in header field name')
		}
		return name.toLowerCase()
	}

	function normalizeValue(value) {
		if (typeof value !== 'string') {
			value = String(value)
		}
		return value
	}

	// Build a destructive iterator for the value list
	function iteratorFor(items) {
		var iterator = {
			next: function () {
				var value = items.shift();
				return {done: value === undefined, value: value}
			}
		};

		if (support.iterable) {
			iterator[Symbol.iterator] = function () {
				return iterator
			}
		}

		return iterator
	}

	function Headers(headers) {
		this.map = {};

		if (headers instanceof Headers) {
			headers.forEach(function (value, name) {
				this.append(name, value)
			}, this)
		}
		else if (Array.isArray(headers)) {
			headers.forEach(function (header) {
				this.append(header[0], header[1])
			}, this)
		}
		else if (headers) {
			Object.getOwnPropertyNames(headers).forEach(function (name) {
				this.append(name, headers[name])
			}, this)
		}
	}

	Headers.prototype.append = function (name, value) {
		name = normalizeName(name);
		value = normalizeValue(value);
		var oldValue = this.map[name];
		this.map[name] = oldValue ? oldValue + ',' + value : value
	};

	Headers.prototype['delete'] = function (name) {
		delete this.map[normalizeName(name)]
	};

	Headers.prototype.get = function (name) {
		name = normalizeName(name);
		return this.has(name) ? this.map[name] : null
	};

	Headers.prototype.has = function (name) {
		return this.map.hasOwnProperty(normalizeName(name))
	};

	Headers.prototype.set = function (name, value) {
		this.map[normalizeName(name)] = normalizeValue(value)
	};

	Headers.prototype.forEach = function (callback, thisArg) {
		for (var name in this.map) {
			if (this.map.hasOwnProperty(name)) {
				callback.call(thisArg, this.map[name], name, this)
			}
		}
	};

	Headers.prototype.keys = function () {
		var items = [];
		this.forEach(function (value, name) {
			items.push(name)
		});
		return iteratorFor(items)
	};

	Headers.prototype.values = function () {
		var items = [];
		this.forEach(function (value) {
			items.push(value)
		});
		return iteratorFor(items)
	};

	Headers.prototype.entries = function () {
		var items = [];
		this.forEach(function (value, name) {
			items.push([name, value])
		});
		return iteratorFor(items)
	};

	if (support.iterable) {
		Headers.prototype[Symbol.iterator] = Headers.prototype.entries
	}

	function consumed(body) {
		if (body.bodyUsed) {
			return Promise.reject(new TypeError('Already read'))
		}
		body.bodyUsed = true
	}

	function fileReaderReady(reader) {
		return new Promise(function (resolve, reject) {
			reader.onload = function () {
				resolve(reader.result)
			};
			reader.onerror = function () {
				reject(reader.error)
			}
		})
	}

	function readBlobAsArrayBuffer(blob) {
		var reader = new FileReader();
		var promise = fileReaderReady(reader);
		reader.readAsArrayBuffer(blob);
		return promise
	}

	function readBlobAsText(blob) {
		var reader = new FileReader();
		var promise = fileReaderReady(reader);
		reader.readAsText(blob);
		return promise
	}

	function readArrayBufferAsText(buf) {
		var view = new Uint8Array(buf);
		var chars = new Array(view.length);

		for (var i = 0; i < view.length; i++) {
			chars[i] = String.fromCharCode(view[i])
		}
		return chars.join('')
	}

	function bufferClone(buf) {
		if (buf.slice) {
			return buf.slice(0)
		}
		else {
			var view = new Uint8Array(buf.byteLength);
			view.set(new Uint8Array(buf));
			return view.buffer
		}
	}

	function Body() {
		this.bodyUsed = false;

		this._initBody = function (body) {
			this._bodyInit = body;
			if (!body) {
				this._bodyText = ''
			}
			else if (typeof body === 'string') {
				this._bodyText = body
			}
			else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
				this._bodyBlob = body
			}
			else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
				this._bodyFormData = body
			}
			else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
				this._bodyText = body.toString()
			}
			else if (support.arrayBuffer && support.blob && isDataView(body)) {
				this._bodyArrayBuffer = bufferClone(body.buffer);
				// IE 10-11 can't handle a DataView body.
				this._bodyInit = new Blob([this._bodyArrayBuffer])
			}
			else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
				this._bodyArrayBuffer = bufferClone(body)
			}
			else {
				throw new Error('unsupported BodyInit type')
			}

			if (!this.headers.get('content-type')) {
				if (typeof body === 'string') {
					this.headers.set('content-type', 'text/plain;charset=UTF-8')
				}
				else if (this._bodyBlob && this._bodyBlob.type) {
					this.headers.set('content-type', this._bodyBlob.type)
				}
				else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
					this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
				}
			}
		};

		if (support.blob) {
			this.blob = function () {
				var rejected = consumed(this);
				if (rejected) {
					return rejected
				}

				if (this._bodyBlob) {
					return Promise.resolve(this._bodyBlob)
				}
				else if (this._bodyArrayBuffer) {
					return Promise.resolve(new Blob([this._bodyArrayBuffer]))
				}
				else if (this._bodyFormData) {
					throw new Error('could not read FormData body as blob')
				}
				else {
					return Promise.resolve(new Blob([this._bodyText]))
				}
			};

			this.arrayBuffer = function () {
				if (this._bodyArrayBuffer) {
					return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
				}
				else {
					return this.blob().then(readBlobAsArrayBuffer)
				}
			}
		}

		this.text = function () {
			var rejected = consumed(this);
			if (rejected) {
				return rejected
			}

			if (this._bodyBlob) {
				return readBlobAsText(this._bodyBlob)
			}
			else if (this._bodyArrayBuffer) {
				return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
			}
			else if (this._bodyFormData) {
				throw new Error('could not read FormData body as text')
			}
			else {
				return Promise.resolve(this._bodyText)
			}
		};

		if (support.formData) {
			this.formData = function () {
				return this.text().then(decode)
			}
		}

		this.json = function () {
			return this.text().then(JSON.parse)
		};

		return this
	}

	// HTTP methods whose capitalization should be normalized
	var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

	function normalizeMethod(method) {
		var upcased = method.toUpperCase();
		return (methods.indexOf(upcased) > -1) ? upcased : method
	}

	function Request(input, options) {
		options = options || {};
		var body = options.body;

		if (input instanceof Request) {
			if (input.bodyUsed) {
				throw new TypeError('Already read')
			}
			this.url = input.url;
			this.credentials = input.credentials;
			if (!options.headers) {
				this.headers = new Headers(input.headers)
			}
			this.method = input.method;
			this.mode = input.mode;
			if (!body && input._bodyInit != null) {
				body = input._bodyInit;
				input.bodyUsed = true
			}
		}
		else {
			this.url = String(input)
		}

		this.credentials = options.credentials || this.credentials || 'omit';
		if (options.headers || !this.headers) {
			this.headers = new Headers(options.headers)
		}
		this.method = normalizeMethod(options.method || this.method || 'GET');
		this.mode = options.mode || this.mode || null;
		this.referrer = null;

		if ((this.method === 'GET' || this.method === 'HEAD') && body) {
			throw new TypeError('Body not allowed for GET or HEAD requests')
		}
		this._initBody(body)
	}

	Request.prototype.clone = function () {
		return new Request(this, {body: this._bodyInit})
	};

	function decode(body) {
		var form = new FormData();
		body.trim().split('&').forEach(function (bytes) {
			if (bytes) {
				var split = bytes.split('=');
				var name = split.shift().replace(/\+/g, ' ');
				var value = split.join('=').replace(/\+/g, ' ');
				form.append(decodeURIComponent(name), decodeURIComponent(value))
			}
		});
		return form
	}

	function parseHeaders(rawHeaders) {
		var headers = new Headers();
		// Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
		// https://tools.ietf.org/html/rfc7230#section-3.2
		var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
		preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
			var parts = line.split(':');
			var key = parts.shift().trim();
			if (key) {
				var value = parts.join(':').trim();
				headers.append(key, value)
			}
		});
		return headers
	}

	Body.call(Request.prototype);

	function Response(bodyInit, options) {
		if (!options) {
			options = {}
		}

		this.type = 'default';
		this.status = 'status' in options ? options.status : 200;
		this.ok = this.status >= 200 && this.status < 300;
		this.statusText = 'statusText' in options ? options.statusText : 'OK';
		this.headers = new Headers(options.headers);
		this.url = options.url || '';
		this._initBody(bodyInit)
	}

	Body.call(Response.prototype);

	Response.prototype.clone = function () {
		return new Response(this._bodyInit, {
			status: this.status,
			statusText: this.statusText,
			headers: new Headers(this.headers),
			url: this.url
		})
	};

	Response.error = function () {
		var response = new Response(null, {status: 0, statusText: ''});
		response.type = 'error';
		return response
	};

	var redirectStatuses = [301, 302, 303, 307, 308];

	Response.redirect = function (url, status) {
		if (redirectStatuses.indexOf(status) === -1) {
			throw new RangeError('Invalid status code')
		}

		return new Response(null, {status: status, headers: {location: url}})
	};

	self.Headers = Headers;
	self.Request = Request;
	self.Response = Response;

	self.fetch = function (input, init) {
		return new Promise(function (resolve, reject) {
			var request = new Request(input, init);
			var xhr = new XMLHttpRequest();

			xhr.onload = function () {
				var options = {
					status: xhr.status,
					statusText: xhr.statusText,
					headers: parseHeaders(xhr.getAllResponseHeaders() || '')
				};
				options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
				var body = 'response' in xhr ? xhr.response : xhr.responseText
				resolve(new Response(body, options))
			};

			xhr.onerror = function () {
				reject(new TypeError('Network request failed'))
			};

			xhr.ontimeout = function () {
				reject(new TypeError('Network request failed'))
			};

			xhr.open(request.method, request.url, true);

			if (request.credentials === 'include') {
				xhr.withCredentials = true
			}

			if ('responseType' in xhr && support.blob) {
				xhr.responseType = 'blob'
			}

			request.headers.forEach(function (value, name) {
				xhr.setRequestHeader(name, value)
			});

			xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
		});
	};
	self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);





/**
 * Array.from was added to the ECMA-262 standard in the 6th edition (ES2015); as such it may not be present in other
 * implementations of the standard. You can work around this by inserting the following code at the beginning of your
 * scripts, allowing use of Array.from in implementations that don't natively support it. This algorithm is exactly the
 * one specified in ECMA-262, 6th edition, assuming Object and TypeError have their original values and that
 * callback.call evaluates to the original value of Function.prototype.call. In addition, since true iterables can not
 * be polyfilled, this implementation does not support generic iterables as defined in the 6th edition of ECMA-262.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Polyfill
 */
if (!Array.from) {
	Array.from = (function () {
		var toStr = Object.prototype.toString;
		var isCallable = function (fn) {
			return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
		};
		var toInteger = function (value) {
			var number = Number(value);
			if (isNaN(number)) {
				return 0;
			}
			if (number === 0 || !isFinite(number)) {
				return number;
			}
			return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		};
		var maxSafeInteger = Math.pow(2, 53) - 1;
		var toLength = function (value) {
			var len = toInteger(value);
			return Math.min(Math.max(len, 0), maxSafeInteger);
		};

		// The length property of the from method is 1.
		return function from(arrayLike/*, mapFn, thisArg */) {
			// 1. Let C be the this value.
			var C = this;

			// 2. Let items be ToObject(arrayLike).
			var items = Object(arrayLike);

			// 3. ReturnIfAbrupt(items).
			if (arrayLike == null) {
				throw new TypeError('Array.from requires an array-like object - not null or undefined');
			}

			// 4. If mapfn is undefined, then let mapping be false.
			var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
			var T;
			if (typeof mapFn !== 'undefined') {
				// 5. else
				// 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
				if (!isCallable(mapFn)) {
					throw new TypeError('Array.from: when provided, the second argument must be a function');
				}

				// 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
				if (arguments.length > 2) {
					T = arguments[2];
				}
			}

			// 10. Let lenValue be Get(items, "length").
			// 11. Let len be ToLength(lenValue).
			var len = toLength(items.length);

			// 13. If IsConstructor(C) is true, then
			// 13. a. Let A be the result of calling the [[Construct]] internal method
			// of C with an argument list containing the single item len.
			// 14. a. Else, Let A be ArrayCreate(len).
			var A = isCallable(C) ? Object(new C(len)) : new Array(len);

			// 16. Let k be 0.
			var k = 0;
			// 17. Repeat, while k < len… (also steps a - h)
			var kValue;
			while (k < len) {
				kValue = items[k];
				if (mapFn) {
					A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
				}
				else {
					A[k] = kValue;
				}
				k += 1;
			}
			// 18. Let putStatus be Put(A, "length", len, true).
			A.length = len;
			// 20. Return A.
			return A;
		};
	}());
}





/**
 * You can polyfill the append() method in Internet Explorer 9 and higher with the following code: *
 * https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/append#Polyfill
 */
(function (arr) {
	arr.forEach(function (item) {
		if (item.hasOwnProperty('append')) {
			return;
		}
		Object.defineProperty(item, 'append', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function append() {
				var argArr = Array.prototype.slice.call(arguments),
					docFrag = document.createDocumentFragment();

				argArr.forEach(function (argItem) {
					var isNode = argItem instanceof Node;
					docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
				});

				this.appendChild(docFrag);
			}
		});
	});
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);





/**
 * This is a 'CustomEvent()' polyfill for IE 9-11 to generate the proper thumbnails.
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
(function () {
	'use strict';

	if (typeof window.CustomEvent === 'function') {
		return false;
	}

	function CustomEvent(event, params) {
		let custom_event = document.createEvent('CustomEvent');

		params = params || {
			bubbles: false,
			cancelable: false,
			detail: undefined
		};

		custom_event.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return custom_event;
	}

	CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = CustomEvent;
})();
