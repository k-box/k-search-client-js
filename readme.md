# K-Search JavaScript library

Search on a K-Link from any website.

_Features_

- Embed the search form on any website.
- Easy inclusion and configuration snippets for HTML5 or JavaScript.
- Three different visualization modes
- Self contained, no pre-requirements

_Planned enhancements_

* [ ] Show to the user that a search is in progress
* [ ] Support for Localization and i18n
* [ ] Ctrl+K Ctrl+F for focusing on the K-Search field
* [ ] Get the search term from the query string if available

## Browser support

K-Search support modern browsers: Microsoft Edge (14+), Google Chrome, Mozilla Firefox,
Opera (40+), Safari (10), iOS Safari 10.3+, Chrome on Android, Firefox on Android and even IE9,
IE10 and IE11. Support for Internet Explorer 8, Opera Mini or Android Stock Browser before Android 4
is not given and will not be considered for future updates.

For a detailed overview of which technologies we are using and their browser support please
refer to the [Browser matrix](./docs/browser-matrix.md) documentation page.

## Setup

To include the K-Search on your page you need to have a container element, like a `div`, in the area you want
the search to appear. For example in the header on the side of the logo

```html
  <header>
      <h1>Logo</h1>

      <nav>
        <!-- I want the search here -->
        <div data-k-search class="k-search"></div>
      </nav>
  </header>
```

Then you need to place our CSS and Javascript dependencies. We suggest to include the **css in the `head`** of the page
and the **Javascript before the closing `</body>`** tag.

```html
<!-- CSS -->
<link rel="stylesheet" href="https://releases.klink.asia/k-search-js/0/k-search.min.css" />

<!-- Javascript -->
<script type="text/javascript" src="https://releases.klink.asia/k-search-js/0/k-search.min.js"></script>
```

To initialize the K-Search library you can follow: (1) a javascript approach or (2) a data attribute based approach.

?[Before proceed make sure you have the token and the K-Link endpoint url]

More integration examples can be found in the [`examples` folder](./examples).

### via Javascript

If you want to initialize the library via javascript you can do that by using the `ksearch` global functions.

```html
<script type="text/javascript">
ksearch({
  token: '<API_TOKEN>',
  url: '<API_URL>',
  selector: '<YOUR_INPUT_DOM_SELECTOR>' // e.g. [data-k-search], .k-search, ...
});
</script>
```

where `<YOUR_INPUT_DOM_SELECTOR>` is the query selector that identifies the HTMLElement you want the search to appear in.
By default the library search for the first element that has the `data-ksearch` attribute (selector: `[data-ksearch]`).


#### Options

- `url: String`: (required) The K-Link compatible endpoint to use for searching
- `token: String`: (required) The API token to obtain access to the Search
- `selector: String`: (default `[data-ksearch]`) Where in the page I should put the K-Search.
   If more elements matches on the page only the first one will be used
- `display: String`: (default `overlay`) The display style.
 - overlay the search box is visible and can expand on top of the other elements of the page when active
 - embed the search box and the results are visible in a page area and cannot hide other elements already in the page
- `collapsed: Boolean`: (default `false`) If the search form should be collapsed to use less space on the page
- `expandable: Boolean`: (default `true`) If the search input should become bigger when user interacts with it and the
   search results. If the `collapsed` option is set to true the `expandable` option will always be active.
- `language: String`: (default `en`) The language for user interface localization. Currently supported only `en`

### via data attributes

This is the fastest configuration method as its done entirely in html

```html
<div class="k-search" data-ksearch-auto data-token="<API_KEY>" data-url="<URL_TO_KLINK>"></div>
```

The following data attributes are supported:

- `data-ksearch-auto`: (required) identify that the element is the search container and should auto load
   the configuration values
- `data-url`: (required) The K-Link compatible endpoint to use for searching
- `data-token`: (required) The API token to obtain access to the Search
- `data-display`: The display style.
 - overlay the search box is visible and can expand on top of the other elements of the page when active. The
   results are presented in a dialog below the search input field
 - embed the search box and the results are visible in a page area and cannot hide other elements already in the page
- `data-collapsed`: If the search form should be collapsed to use less space on the page, for example if used in the header.
  This is a boolean attribute, so no explicit value is required.


## Development

Development of the library rely on

- Node 8.9+
- [Yarn](https://yarnpkg.com/)

Before going into development, install the dependencies

```
yarn
```

**Do not edit the dependencies directly in package.json, use the `yarn` command line instead**

## Testing

Testing ensure that the library will behave as intended in all the supporting browsers.
Tests suite use [Jest](https://facebook.github.io/jest/).

All the tests are in the `tests` subfolder.

Test are divided in _unit tests_ and _integration tests_. Unit tests focuses on testing specific functions
and browser agnostic modules, while integration tests try to replicate the usage of the library in a browser.

To run all the tests use:

```
yarn test
```

While developing you can also run

```
yarn test:watch
```

This will execute only tests related to changed files based on hg/git (uncommitted files).
(See [Jest Doc](https://facebook.github.io/jest/docs/cli.html#running-from-the-command-line))

## Contributing

Contribution to the project are very welcomed.

To ensure code consistency between you an other contributors we have `eslint` setup to reject a commit if the code
style rules are not respected. You can also run the linter by yourself with `run run lint`.
