const format = require('../src/utils/format.js');

test('format is defined', () => {
    expect(format).not.toBeUndefined();
    expect(format.filesize).not.toBeUndefined();
    expect(format.duration).not.toBeUndefined();
    expect(format.datetime).not.toBeUndefined();
});

test('filesize is reported in Byte', () => {
    
    expect(format.filesize(1)).toBe("1 Byte");

});

test('filesize is reported in KB', () => {
    
    expect(format.filesize(1024)).toBe("1.0 KB");

});

test('filesize is reported in MB', () => {
    
    expect(format.filesize(1024 * 1024)).toBe("1.0 MB");

});

test('filesize is reported in GB', () => {
    
    expect(format.filesize(1024 * 1024 * 1024)).toMatch(/1.* GB/);

});

test('duration is reported with hours, minutes and seconds', () => {
    
    expect(format.duration("01:02:03.456789")).toBe("1h 2m 3s");

});

test('duration 02:03.456789', () => {
    
    expect(format.duration("02:03.456789")).toBe("2m 3s");

});

test('duration 02:03', () => {
    
    expect(format.duration("02:03")).toBe("2m 3s");

});

test('duration 2:3', () => {
    
    expect(format.duration("2:3")).toBe("2m 3s");

});

test('duration 0:2:3.1', () => {
    
    expect(format.duration("0:2:3.1")).toBe("2m 3s");

});

test('duration 10:1:2:3.1', () => {
    
    expect(format.duration("10:1:2:3.1")).toBe("10 days 1h 2m 3s");

});

test('duration 0:1:2:3.1', () => {
    
    expect(format.duration("0:1:2:3.1")).toBe("1h 2m 3s");

});

test('string used as duration don\'t throw error', () => {
    
    expect(format.duration("hello")).toBe("hello");

});

test('datetime is converted', () => {
    
    expect(format.datetime("2018-03-15T14:51Z")).toMatch("3/15/2018");

});
