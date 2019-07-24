/**
 * When called from a `theme.js` file on a product page, this extension will
 * work with the default page code to add a product to the cart utilizing an
 * AJAX call to the form processor.
 *
 * The function contains internal error checking as well as a check to see which
 * page was reached and displaying messages accordingly. If the store is also
 * utilizing the `mini-basket` extension, said extension will be triggered for
 * display upon successfully adding a product to the cart.
 */
(function (window, document, undefined) {
	'use strict';

	var purchaseButton = document.querySelector('[data-hook="add-to-cart"]');
	var purchaseButtonText = (purchaseButton.nodeName.toLowerCase() === 'input') ? purchaseButton.value : purchaseButton.textContent;
	var purchaseForm = document.querySelector('[data-hook="purchase"]');
	var purchaseFormActionInput = purchaseForm.querySelector('input[name="Action"]');
	var responseMessage = document.querySelector('[data-hook="purchase-message"]');
	var miniBasketCount = document.querySelectorAll('[data-hook~="mini-basket-count"]');
	var miniBasketAmount = document.querySelectorAll('[data-hook~="mini-basket-amount"]');

	purchaseForm.addEventListener('submit', function (evt) {
		if (purchaseFormActionInput.value !== 'ADPR') {
			return;
		}

		evt.preventDefault();
		evt.stopImmediatePropagation();

		purchaseForm.action = purchaseButton.getAttribute('data-action');
		purchaseFormActionInput.value = 'ADPR';

		var data = new FormData(purchaseForm);
		var request = new XMLHttpRequest(); // Set up our HTTP request

		purchaseForm.setAttribute('data-status', 'idle');

		if (purchaseForm.getAttribute('data-status') !== 'submitting') {
			purchaseForm.setAttribute('data-status', 'submitting');
			purchaseButton.classList.add('is-disabled');

			if (purchaseButton.nodeName.toLowerCase() === 'input') {
				purchaseButton.value = 'Processing...';
			}
			else{
				purchaseButton.textContent = 'Processing...';
			}

			responseMessage.innerHTML = '';

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

					if (response.body.id === 'js-BASK') {
						var basketData = response.querySelector('[data-hook="mini-basket"]');
						var basketCount = basketData.getAttribute('data-item-count');
						var basketSubtotal = basketData.getAttribute('data-subtotal');

						if (miniBasketCount) {
							for (var mbcID = 0; mbcID < miniBasketCount.length; mbcID++) {
								miniBasketCount[mbcID].textContent = basketCount; // Update mini-basket quantity (display only)
							}
						}

						if (miniBasketAmount) {
							for (var mbaID = 0; mbaID < miniBasketAmount.length; mbaID++) {
								miniBasketAmount[mbaID].textContent = basketSubtotal; // Update mini-basket subtotal (display only)
							}
						}

						if (typeof miniBasket !== 'undefined') {
							document.querySelector('[data-hook="mini-basket"]').innerHTML = response.querySelector('[data-hook="mini-basket"]').innerHTML;

							setTimeout(function () {
								document.querySelector('[data-hook="open-mini-basket"]').click();
							}, 100);
						}
						else {
							responseMessage.innerHTML = '<div class="x-messages x-messages--success"><span class="u-icon-check"></span> Added to cart.</div>';
						}

						// Re-Initialize Attribute Machine (if it is active)
						if (typeof attrMachCall !== 'undefined') {
							attrMachCall.Initialize();
						}
					}
					else if(response.body.id === 'js-PATR') {
						var findRequired = purchaseForm.querySelectorAll('.is-required');
						var missingAttributes = [];

						for (var id = 0; id < findRequired.length; id++) {
							missingAttributes.push(' ' + findRequired[id].title);
						}

						responseMessage.innerHTML = '<div class="x-messages x-messages--warning">All <em class="u-color-red">Required</em> options have not been selected.<br />Please review the following options: <span class="u-color-red">' + missingAttributes + '</span>.</div>';
					}
					else if(response.body.id === 'js-PLMT') {
						responseMessage.innerHTML = '<div class="x-messages x-messages--warning">We do not have enough of the combination you have selected.<br />Please adjust your quantity.</div>';
					}
					else if(response.body.id === 'js-POUT') {
						responseMessage.innerHTML = '<div class="x-messages x-messages--warning">The combination you have selected is out of stock.<br />Please review your options or check back later.</div>';
					}
					else {
						responseMessage.innerHTML = '<div class="x-messages x-messages--warning">Please review your selection.</div>';
					}

					// Reset button text and form status
					purchaseButton.classList.remove('is-disabled');

					purchaseButton.style.backgroundColor = '#307962';
					purchaseButton.style.color = '#fff';
					if (purchaseButton.nodeName.toLowerCase() === 'input') {
						purchaseButton.value = 'Product Added';
					}
					else{
						purchaseButton.textContent = 'Product Added';
					}

					setTimeout(function () {
						if (purchaseButton.nodeName.toLowerCase() === 'input') {
							purchaseButton.value = purchaseButtonText;
						}
						else{
							purchaseButton.textContent = purchaseButtonText;
						}
						purchaseButton.removeAttribute('style');
					}, 3000);

					purchaseForm.setAttribute('data-status', 'idle');
				}
				else {
					// What do when the request fails
					console.log('The request failed!');
					purchaseForm.setAttribute('data-status', 'idle');
				}
			};

			/**
			 * Create and send a request
			 * The first argument is the post type (GET, POST, PUT, DELETE, etc.)
			 * The second argument is the endpoint URL
			 */
			request.open(purchaseForm.method, purchaseForm.action, true);
			request.responseType = 'document';
			request.send(data);
		}
	}, false);

})(window, document);
