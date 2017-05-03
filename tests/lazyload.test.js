
const LazyLoad = require('../src/utils/lazyload.js');

// module definition 

test('LazyLoad init function is defined', () => {
  expect(LazyLoad.init).not.toBeUndefined();
});

test('LazyLoad init call', () => {

  document.body.innerHTML =
    '<div class="klinksearch__result klinkjs-lazy-image" data-src="https://placehold.it/350x150">' +
        '<a href="{{{documentURI}}}" class="klinksearch__result__link" rel="nofollow noopener">' +
            '<span class="klinksearch__result__icon"></span>' +
            '<span class="klinksearch__result__thumbnail"><span class="klinksearch__result__thumbnail__content klinkjs-lazy-image-content"></span></span>' +
            '<span class="klinksearch__result__title">{{{title}}}</span>' +
            '<span class="klinksearch__result__info">' +
                '<span class="klinksearch__result__meta">' +
                    '{{{language}}}' +
                '</span>' +
                '<span class="klinksearch__result__meta">' +
                    '{{{creationDate}}}' +
                '</span>' +
                '<span class="klinksearch__result__meta klinksearch__result__meta--source">' +
                    '{{{institutionID}}}' +
                '</span>' +
            '</span>' +
        '</a>' +
    '</div>';

  LazyLoad.init();

  expect(document.querySelector('.klinksearch__result').getAttribute('class').trim()).toBe('klinksearch__result klinkjs-lazy-image');
  // TODO: is not possible to trigger Image.onload event to test the full chain
});

