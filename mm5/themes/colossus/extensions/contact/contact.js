(function () {
	'use strict';

	var contactForm = document.querySelector('[data-hook="contact-form"]');

	if (contactForm) {
		var contactFormAction = contactForm.getAttribute('data-action');
		var contactFormButton = document.querySelector('[data-hook="contact-form__submit"]');

		contactForm.classList.remove('u-hidden');

		/**
		 * Unlock the form if the user is utilizing a touch interface.
		 */
		window.addEventListener('touchstart', function touchedForm() {
			contactForm.setAttribute('action', contactFormAction);
			contactFormButton.removeAttribute('disabled');
			window.removeEventListener('touchstart', touchedForm, false);
		}, false);

		/**
		 * Unlock the form if the user can hover over elements.
		 */
		window.addEventListener('mouseover', function mouseForm() {
			contactForm.setAttribute('action', contactFormAction);
			contactFormButton.removeAttribute('disabled');
			window.removeEventListener('mouseover', mouseForm, false);
		}, false);
	}
})();
