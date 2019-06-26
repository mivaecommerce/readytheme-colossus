MMSearchField.prototype.onMenuAppendHeader = function () {
	return null;
};

MMSearchField.prototype.onMenuAppendItem = function (data) {
	var span;

	span = newElement('span', {'class': 'x-search-preview__entry'}, null, null);
	span.innerHTML = data;

	return span;
};

MMSearchField.prototype.onMenuAppendStoreSearch = function (search_value) {
	var item;

	item = newElement('div', {'class': 'x-search-preview__search-all'}, null, null);
	item.element_text = newTextNode('Search store for product "' + search_value + '"', item);

	return item;
};

MMSearchField.prototype.onFocus = function () {
	this.element_menu.classList.toggle('x-search-preview--open');
};

MMSearchField.prototype.onBlur = function () {
	this.element_menu.classList.toggle('x-search-preview--open');
};
