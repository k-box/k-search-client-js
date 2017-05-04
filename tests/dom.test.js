const DOM = require('../src/utils/dom.js');

// module definition 

test('DOM functions are defined', () => {
  expect(DOM.matches).not.toBeUndefined();
  expect(DOM.parentMatching).not.toBeUndefined();
});

// Matches function

test('Matches return true', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" />' +
    '  <button id="button" />' +
    '</div>';

  expect(DOM.matches(document.querySelector('.k-search--target'), '.k-search--target')).toBe(true);
});

test('Matches return false', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" />' +
    '  <button id="button" />' +
    '</div>';

  expect(DOM.matches(document.querySelector('.k-search--target'), '#button')).toBe(false);
});

test('Matches handles undefined parameters', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" />' +
    '  <button id="button" />' +
    '</div>';

  expect(DOM.matches(document.querySelector('.k-search'))).toBe(false);
  expect(DOM.matches(null, '#button')).toBe(false);
});

// parentMatching

test('parentMatching returns the parent element', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target"><strong class="start--here">Hello</strong></span>' +
    '  <button id="button" />' +
    '</div>';

  var parent = DOM.parentMatching(document.querySelector('.start--here'), '.k-search--target');

  expect(parent).not.toBeFalsy();
  expect(parent.tagName).toBe('SPAN');
});

test('parentMatching returns the parent of the parent element', () => {

   document.body.innerHTML =
    '<div class="parent--parent">' +
    '  <span class="k-search--target"><strong class="start--here">Hello</strong></span>' +
    '  <button id="button" />' +
    '</div>';

  var parent = DOM.parentMatching(document.querySelector('.start--here'), '.parent--parent');

  expect(parent).not.toBeFalsy();
  expect(parent.tagName).toBe('DIV');
});

test('parentMatching returns the current element', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target"><strong class="start--here">Hello</strong></span>' +
    '  <button id="button" />' +
    '</div>';

  var parent = DOM.parentMatching(document.querySelector('.start--here'), '.start--here');

  expect(parent).not.toBeFalsy();
  expect(parent.tagName).toBe('STRONG');
});

test('parentMatching returns null', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target"><strong class="start--here">Hello</strong></span>' +
    '  <button id="button" />' +
    '</div>';

  var parent = DOM.parentMatching(document.querySelector('.start--here'), '.a--parent');

  expect(parent).toBeNull();
});

// data function

test('data retrieves attribute using getAttribute', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');

  el.dataset = undefined;

  var data = DOM.data(el, 'somethingComplex');

  expect(data).not.toBeNull();
  expect(data).toBe("123456");
});

test('data retrieves attribute using dataset', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');

  var data = DOM.data(el, 'somethingComplex');

  expect(data).not.toBeNull();
  expect(data).toBe("123456");
});

test('data retrieves null attribute using getAttribute', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');

  el.dataset = undefined;

  var data = DOM.data(el, 'hello');

  expect(data).toBeNull();
});

test('data retrieves null attribute using dataset', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');

  var data = DOM.data(el, 'hello');

  expect(data).toBeNull();
});

// classRemove

test('css class remove', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target class-to-be-removed" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');

  DOM.classRemove(el, 'class-to-be-removed');

  expect(el.getAttribute('class').trim()).toBe('k-search--target');
});

test('css class remove polyfill', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target class-to-be-removed" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');
  var _remove = el.classList.remove;

  el.classList.remove = undefined; //simulate browser that do not support the feature

  DOM.classRemove(el, 'class-to-be-removed');

  el.classList.remove = _remove;

  expect(el.getAttribute('class').trim()).toBe('k-search--target');
});

// classAdd

test('css class add', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');

  DOM.classAdd(el, 'class-to-be-added');

  expect(el.getAttribute('class').trim()).toBe('k-search--target class-to-be-added');
});

test('css class add polyfill', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');
  var _add = el.classList.add;

  el.classList.add = undefined; //simulate browser that do not support the feature

  DOM.classAdd(el, 'class-to-be-added');

  el.classList.add = _add;

  expect(el.getAttribute('class').trim()).toBe('k-search--target class-to-be-added');
});

test('css class add twice', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target class-to-be-added" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');

  DOM.classAdd(el, 'class-to-be-added');

  expect(el.getAttribute('class').trim()).toBe('k-search--target class-to-be-added');
});

test('css class add twice polyfill', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target class-to-be-added" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');
  var _add = el.classList.add;

  el.classList.add = undefined; //simulate browser that do not support the feature

  DOM.classAdd(el, 'class-to-be-added');

  el.classList.add = _add;

  expect(el.getAttribute('class').trim()).toBe('k-search--target class-to-be-added');
});

// classContains

test('css class contains true', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target class-to-be-checked" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');

  var result = DOM.classContains(el, 'class-to-be-checked');

  expect(result).toBe(true);
});

test('css class contains true with polyfill', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target class-to-be-checked" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');
  var _contains = el.classList.contains;

  el.classList.contains = undefined; //simulate browser that do not support the feature

  var result = DOM.classContains(el, 'class-to-be-checked');

  el.classList.contains = _contains;

  expect(result).toBe(true);
});

test('css class contains false', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');

  var result = DOM.classContains(el, 'class-to-be-checked');

  expect(result).toBe(false);
});

test('css class contains false with polyfill', () => {

   document.body.innerHTML =
    '<div>' +
    '  <span class="k-search--target" data-something-complex="123456">hello</span>' +
    '</div>';

  var el = document.querySelector('.k-search--target');
  var _contains = el.classList.contains;

  el.classList.contains = undefined; //simulate browser that do not support the feature

  var result = DOM.classContains(el, 'class-to-be-checked');

  el.classList.contains = _contains;

  expect(result).toBe(false);
});
