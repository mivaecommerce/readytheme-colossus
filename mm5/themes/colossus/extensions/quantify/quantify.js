/**
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |q|u|a|n|t|i|f|y|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * This extension allows for the use of buttons to increase/decrease item
 * quantities on the product and basket pages. When used on the basket page,
 * the decrease button becomes a remove button if the quantity is 1.
 */

(function () {
	'use strict';

	var adjusters = document.querySelectorAll('[data-hook="quantify"]');

	for (var id = 0; id < adjusters.length; id++) {
		/**
		 * This listener prevents the `enter` key from adjusting the `input` value.
		 */
		adjusters[id].addEventListener('keydown', function (keyEvent) {
			if (keyEvent.target.matches('input')) {
				if (keyEvent.key === 'Enter') {
					keyEvent.preventDefault();
				}
			}
		});

		adjusters[id].addEventListener('click', function (event) {
			if (event.target.matches('button')) {
				var button = event.target;
				var inputs = [].filter.call(this.children, function (sibling) {
					return sibling !== button && sibling.matches('input');
				});
				var input = inputs[0];
				var value = parseInt(input.value);
				var action = button.getAttribute('data-action');
				var changed = document.createEvent('HTMLEvents');
				var groupForm = document.querySelector('[data-hook="' + input.getAttribute('data-group') + '"]');

				changed.initEvent('change', true, false);
				event.stopPropagation();
				event.preventDefault();

				if (action === 'decrement') {
					/**
					 * THIS CAN BE USED TO SET A MINIMUM QUANTITY
					 * value = value > 5 ? value - 1 : 5;
					 */
					value = value > 1 ? value - 1 : 1;

					input.value = value;
					input.dispatchEvent(changed);
					allowRemoveUpdate();
				}
				else if (action === 'increment') {
					/**
					 * THIS CAN BE USED TO SET A MAXIMUM QUANTITY
					 * value = value < 100 ? value + 1 : 100;
					 */
					value = value + 1;

					input.value = value;
					if (groupForm) {
						groupForm.elements['Action'].value = 'QTYG';
					}
					input.dispatchEvent(changed);
					allowRemoveUpdate();
				}
				else {
					input.value = 0;
					input.dispatchEvent(changed);
				}
			}
		});
	}

	function allowRemoveUpdate() {
		var quantities = document.querySelectorAll('[data-hook="group-quantity"]');

		function toggleRemove(row, qty) {
			var removeToggle = row.previousElementSibling;
			var groupForm = document.querySelector('[data-hook="' + row.getAttribute('data-group') + '"]');

			if (removeToggle.dataset.hook !== 'remove') {
				if (qty > '1') {
					if (groupForm) {
						groupForm.elements['Action'].value = 'QTYG';
					}
					removeToggle.classList.remove('u-icon-remove');
					removeToggle.classList.add('u-icon-subtract');
					removeToggle.setAttribute('data-action', 'decrement');
				}
				else if (qty === '1') {
					if (groupForm) {
						groupForm.elements['Action'].value = 'QTYG';
					}
					removeToggle.classList.remove('u-icon-subtract');
					removeToggle.classList.add('u-icon-remove');
					removeToggle.setAttribute('data-action', 'remove');
				}
				else {
					if (groupForm) {
						groupForm.elements['Action'].value = 'RGRP';
					}
					removeToggle.classList.remove('u-icon-subtract');
					removeToggle.classList.add('u-icon-remove');
					removeToggle.setAttribute('data-action', 'remove');
				}
			}
		}

		if (quantities) {
			for (var id = 0; id < quantities.length; id++) {
				var quantityLine = quantities[id];

				toggleRemove(quantityLine, quantityLine.value);

				quantityLine.addEventListener('change', function (event) {
					toggleRemove(this, this.value);
					groupSubmit(event, this);
				});

				quantityLine.addEventListener('input', function (event) {
					toggleRemove(this, this.value);
					groupSubmit(event, this);
				});
			}
		}
	}

	allowRemoveUpdate();

	function groupSubmit(event, quantity) {
		if (event.key !== 8 && event.key !== 37 && event.key !== 38 && event.key !== 39 && event.key !== 40 && event.key !== 46 && quantity.value !== '') {
			document.querySelector('[data-hook="' + event.target.getAttribute('data-group') + '"]').submit();
		}
	}
})();
