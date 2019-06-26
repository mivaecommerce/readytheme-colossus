/**
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |p|a|y|m|e|n|t| |m|e|t|h|o|d|
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * Payment-method is a lightweight plugin which used to help determine the type
 * of credit card being used and set, or update, the payment method field for
 * order submission on the Checkout: Payment Information page in Miva Merchant.
 *
 * Author: Matt Zimmermann [https://github.com/influxweb]
 * Version: 1.0.0
 * License: MIT
 */

function paymentMethod (e, callback) {
	'use strict';

	/**
	 * Retrieve the value of the input and remove all non-numeric characters
	 * @type {string}
	 */
	var number = String(e.value),
		cleanNumber = '';

	for (var charIndex = 0; charIndex < number.length; charIndex++) {
		if (/^[0-9]+$/.test(number.charAt(charIndex))) {
			cleanNumber += number.charAt(charIndex);
		}
	}

	/**
	 * Run the modulus 10 algorithm on the input number if it is at least
	 * equal to the shortest card length.
	 * https://en.wikipedia.org/wiki/Luhn_algorithm
	 */
	if (cleanNumber.length >= 12) {
		var passedMod10 = mod10Validation(cleanNumber);
	}

	function mod10Validation(number) {
		var digit,
			digits,
			i,
			len,
			odd,
			sum;

		odd = true;
		sum = 0;
		digits = (number + '').split('').reverse();

		for (i = 0, len = digits.length; i < len; i++) {
			digit = digits[i];
			digit = parseInt(digit, 10);
			if ((odd = !odd)) {
				digit *= 2;
			}
			if (digit > 9) {
				digit -= 9;
			}
			sum += digit;
		}

		return sum % 10 === 0;
	}

	/**
	 * Credit card types array including regular expressions for matching.
	 * @type {[*]}
	 */
	var card_types = [
		{
			display_name: 'American Express',
			name: 'american-express',
			pattern: /^(?:(3[47][0-9]{13}))/,
			valid_length: [15]
		},
		{
			display_name: 'Diners Club',
			name: 'diners-club',
			pattern: /^(?:(3(?:0[0-5]|[68][0-9])[0-9]{11}))/,
			valid_length: [14]
		},
		{
			display_name: 'JCB',
			name: 'jcb',
			pattern: /^(?:((?:2131|1800|35[0-9]{3})[0-9]{11}))/,
			valid_length: [16]
		},
		{
			display_name: 'Visa',
			name: 'visa',
			pattern: /^(?:(4[0-9]{12}(?:[0-9]{3})?))/,
			valid_length: [16]
		},
		{
			display_name: 'MasterCard',
			name: 'mastercard',
			pattern: /^(?:((?:5[1-5]|2[2-7])[0-9]{14}))$/,
			valid_length: [16]
		},
		{
			display_name: 'Discover',
			name: 'discover',
			pattern: /^(?:(6(?:011|5[0-9]{2})[0-9]{12}))/,
			valid_length: [16]
		}
	];

	/**
	 * Test the input number against mod10 validation.
	 * If it passes, test the input number against each of the above card types.
	 * Return the card name to the callback for additional processing.
	 */
	for (var i = 0; i < card_types.length; i++) {
		if (passedMod10 === true) {
			if (cleanNumber.match(card_types[i].pattern)) {
				var card = {
					display: card_types[i].display_name,
					name: card_types[i].name
				};

				if (typeof callback === 'function') {
					callback(card);
				}
			}
		}
	}

	/**
	 * Get a value from an array by name.
	 * @param name
	 */
	Array.prototype.findPaymentMethod = function (name) {
		'use strict';

		for (var i = 0, len = this.length; i < len; i++) {
			if (typeof this[i] !== 'object') {
				continue;
			}
			if (this[i].name === name) {
				return this[i].value;
			}
		}
	};

}
