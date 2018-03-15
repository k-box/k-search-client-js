const EventEmitter = require('../src/utils/ee.js');

function instance() {

    return Object.create(EventEmitter).constructor();

}

test('EventEmitter is defined', () => {
    expect(EventEmitter).not.toBeUndefined();
    expect(EventEmitter.on).not.toBeUndefined();
    expect(EventEmitter.off).not.toBeUndefined();
    expect(EventEmitter.once).not.toBeUndefined();
    expect(EventEmitter.emit).not.toBeUndefined();
});


test('EventEmitter.on', () => {

    var ee = instance(),
        counter = 0;

    ee.on('ev', () => {
        counter++;
    });

    ee.emit('ev');

    expect(counter).toBe(1);

});



test('EventEmitter.off', () => {

    var ee = instance(),
        counter = 0;

    ee.on('ev', increment);

    ee.off('ev', increment);

    ee.emit('ev');

    expect(counter).toBe(0);

    function increment() {

        counter++;

    }

});



test('EventEmitter.emit', () => {

    var ee = instance();

    ee.on('ev', function (val) {
        expect(val).toBe(42);
    });

    ee.emit('ev', 42);

});



test("EventEmitter.emit on no listeners", () => {

    var ee = instance();

    ee.emit("ev");

});



test('EventEmitter.once', () => {

    var ee = instance(),
        counter = 0;

    ee.once('ev', () => {
        counter++;
    });

    ee.emit('ev');
    ee.emit('ev');

    expect(counter).toBe(1);

});