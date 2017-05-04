
const LazyLoad = require('../src/utils/lazyload.js');

// module definition 

test('LazyLoad init function is defined', () => {
  expect(LazyLoad.init).not.toBeUndefined();
});

test('LazyLoad init call', () => {

  document.body.innerHTML =
    '<div class="k-search__result k-search-js-lazy-image" data-src="https://placehold.it/350x150">' +
        '<a href="{{{documentURI}}}" class="k-search__result__link" rel="nofollow noopener">' +
            '<span class="k-search__result__icon"></span>' +
            '<span class="k-search__result__thumbnail"><span class="k-search__result__thumbnail__content k-search-js-lazy-image-content"></span></span>' +
            '<span class="k-search__result__title">{{{title}}}</span>' +
            '<span class="k-search__result__info">' +
                '<span class="k-search__result__meta">' +
                    '{{{language}}}' +
                '</span>' +
                '<span class="k-search__result__meta">' +
                    '{{{creationDate}}}' +
                '</span>' +
                '<span class="k-search__result__meta k-search__result__meta--source">' +
                    '{{{institutionID}}}' +
                '</span>' +
            '</span>' +
        '</a>' +
    '</div>';

  LazyLoad.init();

  expect(document.querySelector('.k-search__result').getAttribute('class').trim()).toBe('k-search__result k-search-js-lazy-image');
  // TODO: is not possible to trigger Image.onload event to test the full chain
});

