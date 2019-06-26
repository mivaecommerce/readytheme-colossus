/**
 +-+-+-+-+-+-+-+-+-+-+-+-+-+
 |c|u|s|t|o|m| |s|e|l|e|c|t|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * This extension will create a stylish drop-down list from the `select`
 * elements on tbe page. It will pull the currently selected option as well
 * as trigger any change event attached to the original `select`. The new
 * list created from the select will respect any `disabled` attribute on
 * the select or any option.
 */

let changes = (function () {
	'use strict';

	const publicAPIs = {};
	const selectElements = document.querySelectorAll('select');

	publicAPIs.init = function () {
		if (selectElements.length > 0) {
			const mainClass = 'x-custom-select';
			const titleClass = 'x-custom-select__title';
			const listClass = 'x-custom-select__list';
			const listItemClass = 'x-custom-select__list-item';
			const selectedClass = 'is-selected';
			const openClass = 'is-open';
			const disabledClass = 'is-disabled';
			const loadedClass = 'is-loaded';
			let activeContainer;
			let selectCount = selectElements.length;

			while (selectCount--) {
				let selectElement = selectElements[selectCount];
				let selectElementTitle = selectElement.getAttribute('data-label') ? selectElement.getAttribute('data-label') : '';
				let selectOptions = selectElement.options;
				let optionsLength = selectOptions.length;
				let customSelectContainer = document.createElement('div');
				let customSelectTrigger = document.createElement('button');
				let customSelectList = document.createElement('ul');

				if (selectElement.id) {
					customSelectContainer.id = 'custom-' + selectElement.id;
				}
				customSelectContainer.setAttribute('data-hook', 'custom-select');
				customSelectContainer.classList.add(mainClass);
				if (selectElement.hasAttribute('disabled')) {
					customSelectContainer.classList.add(disabledClass);
				}
				customSelectTrigger.setAttribute('type', 'button');
				customSelectTrigger.classList.add(titleClass);
				customSelectTrigger.innerHTML = selectElementTitle;
				customSelectList.classList.add(listClass);

				if (selectElementTitle !== '') {
					selectElementTitle = '<span>' + selectElementTitle + '</span>';
				}

				while (optionsLength--) {
					let li = document.createElement('li');

					li.classList.add(listItemClass);
					if (selectOptions[optionsLength].hasAttribute('disabled')) {
						li.classList.add(disabledClass);
					}
					li.innerHTML = selectOptions[optionsLength].textContent.replace(/[<>]/gi, '');
					li.setAttribute('data-value', selectOptions[optionsLength].value);
					li.setAttribute('data-index', optionsLength);

					if (selectElement.selectedIndex === optionsLength) {
						li.classList.add(selectedClass);
						if (selectElement.hasAttribute('data-append')){
							customSelectTrigger.innerHTML = '<strong>' + selectOptions[optionsLength].textContent.replace(/[<>]/gi, '') + '</strong> ' + selectElementTitle;
						}
						else {
							customSelectTrigger.innerHTML = selectElementTitle + ' <strong>' + selectOptions[optionsLength].textContent.replace(/[<>]/gi, '') + '</strong>';
						}
					}

					customSelectList.insertBefore(li, customSelectList.childNodes[0]);
				}

				customSelectContainer.appendChild(customSelectTrigger);
				customSelectContainer.appendChild(customSelectList);
				selectElement.parentElement.append(customSelectContainer);
				selectElement.parentElement.classList.add('x-custom-select-replacement');
				selectElement.classList.add('u-hidden');
				selectElement.parentElement.classList.add('u-visible');
				customSelectContainer.classList.add(loadedClass);

				customSelectContainer.addEventListener('click', function (clickEvent) {
					clickEvent.preventDefault();

					let target = clickEvent.target;

					activeContainer = target.parentElement;

					if (target.className === titleClass) {
						customSelectList.parentElement.classList.toggle(openClass);
					}

					if (target.tagName === 'LI') {
						if (selectElement.hasAttribute('data-append')){
							customSelectContainer.querySelector('.' + titleClass).innerHTML = '<strong>' + target.innerText.replace(/[<>]/gi, '') + '</strong> ' + selectElementTitle;
						}
						else {
							customSelectContainer.querySelector('.' + titleClass).innerHTML = selectElementTitle + ' <strong>' + target.innerText.replace(/[<>]/gi, '') + '</strong>';
						}
						selectElement.options.selectedIndex = target.getAttribute('data-index');

						//trigger 'change' event
						let evt = new CustomEvent('change');

						selectElement.dispatchEvent(evt);

						let targetSiblings = [].filter.call(target.parentElement.children, function (sibling) {
							return sibling !== target && sibling.matches('li');
						});

						for (let i = 0; i < targetSiblings.length; i++) {
							targetSiblings[i].classList.remove(selectedClass);
						}

						target.classList.add(selectedClass);

						customSelectList.parentElement.classList.remove(openClass);
					}

				});

			}


			/**
			 * Closes the current select on any click outside of it.
			 *
			 */
			document.addEventListener('mousedown', function (mouseEvent) {
				let mouseEventTarget = mouseEvent.target;

				if (activeContainer && activeContainer.classList.contains(openClass)) {
					if (!activeContainer.contains(mouseEventTarget) && mouseEventTarget !== activeContainer) {
						mouseEvent.preventDefault();
						activeContainer.classList.remove(openClass);
					}
				}
			}, false);

		}

	};

	return publicAPIs.init();
}());