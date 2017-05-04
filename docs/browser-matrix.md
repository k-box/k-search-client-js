---
Order: 1
---

# Browser support matrix

The library support the latest version of major browsers (see table below) and have a backward compatibility with the latest stable-2 for the specified platform

| Internet Explorer | Edge    | Firefox   | Chrome    | Safari     | Opera     | iOS Safari   | Android Browser | Chrome Android | Firefox Android | IE Mobile |
|-------------------|---------|-----------|-----------|------------|-----------|--------------|-----------------|----------------|-----------------|-----------|
| 9                 | 13      | 50        | 55        | 9.1        | 42        | 9.3          | 4.4             | -              | -               | -         |
| 10                | 14      | 51        | 56        | 10         | 43        | 10.2         | 4.4.4           | -              | -               | 10        |
| **11**            | **15**  | **52**    | **57**    | **10.1**   | **44**    | **10.3**     | **56**          | **57**         | **52**          | **11**    |


## Feature used and browser support

The next table lists all the specific browser version that supports the Javascript features used by the library.
_Data taken from caniuse.com on the 12 of april 2017._

| Feature              | IE (9-11)  | Edge    | Firefox   | Chrome    | Safari     | Opera     | iOS Safari   | Android Browser | Chrome Android | Firefox Android | IE Mobile |
|----------------------|------------|---------|-----------|-----------|------------|-----------|--------------|-----------------|----------------|-----------------|-----------|
| querySelector        | IE 9+      | 12+     | 30+       | 34+       | 3.1+       | 20+       | 3.2+         | 4+              | 57             | 52              | 10+       |
| classList *          | IE 10+ (4) | 12+     | 30+       | 34+       | 5.1+ (4)   | 20+       | 5.1+ (4)     | 4+ (4)          | 57             | 52              | 10+ (4)   |
| dataset/data attr. * | IE 9+ (3)  | 12+     | 30+       | 34+       | 5.1+       | 20+       | 5.1+         | 4+              | 57             | 52              | 10+ (3)   |
| matches() *          | IE 9+      | 12+     | 34+       | 34+       | 5+         | 21+       | 4.1+         | 4+              | 57             | 52              | 10+       |
| Promises             | IE 9+ (1)  | 12+     | 30+       | 35+       | 7.1+       | 20+       | 8            | 4.4.4+          | 57             | 52              | -         |
| Fetch *              | IE 9+ (2)  | 14+     | 40+       | 42+       | 10.1+      | 29+       | 10.3         | 56              | 57             | 52              | 10+ (2)   |


- _(1) [taylorhakes/promise-polyfill Polyfill](https://github.com/taylorhakes/promise-polyfill) compatible with IE8+, Chrome, Firefox, IOS 4+, Safari 5+, Opera_
- _(2) Partial polyfill of the specification in [src/utils/fetch.js](../src/utils/fetch.js)_
- _(3) Partial support refers to being able to use `data-*` attributes and access them using `getAttribute`._
- _(4) Does not have support for classList on SVG or MathML elements._
       _Does not support the second parameter for the toggle method._
       _Does not support multiple parameters for the add() & remove() methods_
- _* Polyfilled in the library code for the features/functions needed_
- _For Firefox, Chrome and Opera the lowest version number has been limited. Version numbers might not reflect the exact version when the feature was introduced_

### Spec references

- [Promise](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects)
- [Fetch](https://fetch.spec.whatwg.org/)
- [matches()](https://dom.spec.whatwg.org/#dom-element-matches)
- [dataset & data-* attributes](https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
- [classList](https://dom.spec.whatwg.org/#dom-element-classlist)
- [querySelector/querySelectorAll](https://dom.spec.whatwg.org/#dom-parentnode-queryselector)

## Not supported browsers

- Opera Mini
- Internet Explorer 8
- Android stock browser below Android 4
