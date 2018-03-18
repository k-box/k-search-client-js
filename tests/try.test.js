const ksearch = require('../dist/js/k-search.js');

test('k-search is defined', () => {
  expect(window.ksearch).not.toBeUndefined();
});


test('k-search throws error if url is not configured', () => {

  expect(() => {
    window.ksearch({
        token: "AAAA"
    });
  }).toThrowError(/url/i);

});

test('k-search throws error if token is not configured', () => {

  expect(() => {
    window.ksearch({
        url: "http://test.url/"
    });
  }).toThrowError(/token/i);

});