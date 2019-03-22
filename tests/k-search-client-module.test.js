const Client = require('../src/k-search-client-module.js');

test('k-search-client can be instantiated', () => {

    const instance = new Client({
        url: "http://test.url/",
        token: "AAAA"
    });

    expect(instance).not.toBeUndefined();
});

test('k-search-client throws error if url is not configured', () => {

    expect(() => {
        const instance = new Client({
            token: "AAAA"
        });
    }).toThrowError(/url/i);

});

test('k-search-client throws error if token is not configured', () => {

    expect(() => {
        const instance = new Client({
            url: "http://test.url/"
        });
    }).toThrowError(/token/i);

});


test('k-search-client exposes expected api', () => {

    const instance = new Client({
        url: "http://test.url/",
        token: "AAAA"
    });

    expect(instance.find).not.toBeUndefined();
    expect(instance.fetch).not.toBeUndefined();
    expect(instance.get).not.toBeUndefined();
    expect(instance.total).not.toBeUndefined();
    expect(instance.aggregations).not.toBeUndefined();
    expect(instance.klinks).not.toBeUndefined();
});
