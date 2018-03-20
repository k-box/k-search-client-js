# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/0.3.0/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## Added

- Standalone API client to communicate with the K-Search v3 API [#2](https://github.com/k-box/k-search-client-js/pull/2)
- Ability to get the total amount of resourced published on a K-Search instance [#3](https://github.com/k-box/k-search-client-js/pull/3)
- Compatibility option to use the old `Authentication: token` scheme instead of the new `Authentication: Bearer`. This is related to a breaking change introduced in [K-Search 3.1](https://github.com/k-box/k-search/blob/master/changelog.md#v311-1)
- Aggregations and filter support [#6](https://github.com/k-box/k-search-client-js/pull/6)

## Changed

- Moved to Yarn for dependency management [#1](https://github.com/k-box/k-search-client-js/pull/1)
- Upgraded all dependencies to the latest version [#1](https://github.com/k-box/k-search-client-js/pull/1)
- Updated Search UI module to use the API v3 client [#2](https://github.com/k-box/k-search-client-js/pull/2)

## Fixed

## Removed

- Support for K-Search API v2 [#2](https://github.com/k-box/k-search-client-js/pull/2)

## [0.4.0] - 2017-06-19

## Changed

- Font size of the `.k-search__info` message
- If a search was active clicking on the expand/collapse chevron will clear it
- Background color of the search input

## Fixed

- `data-collapsed` not properly checked
- Clicking on the chevron sometimes don't collapse the (search in overlay mode)

## Removed

- Submit and cancel button that were not in the original concept
- Expand and collapse animation as was causing layout problems when collapsing

## [0.3.0] - 2017-06-15

## Added

- Document icons based on descriptor.documentType
- Background color to the thumbnail based on descriptor.documentType
- Expand ability to cover available space on the left of the search container
- Chevron for expanding and collapsing the field

## Changed

- Result meta information now have labels and are in columns
- Repositioned the info message in the search box

## Fixed

- Search field bottom border not visible when display embed was selected
- Search field top border was not thicker than the rest

## [0.2.3] - 2017-06-08

### Fixed

- lazy loading callback was not bound to `this`

## [0.2.2] - 2017-06-08

### Changed

- Updated documentation with examples for all the different usage scenarios

## [0.2.1] - 2017-05-18

### Changed

- Changed button and input styles to reduce the chance that the website style will affect them

### Fixed

- Fixed a case that prevented a collapsible K-Search to return to its collapsed state.
- Fixed a case in the `dom.parentMatching()` that, in Edge, prevented to the get the current 
  element if an element in the SVG shadow DOM was clicked.
- Result template not populated with result data

## [0.2.0] - 2017-05-16

### Changed

- Renamed all CSS classes from `klinksearch*` to `k-search*`
- Renamed JS object to `ksearch`

### Fixed

- Fixed library bundling. Promise polyfill was not included.

## [0.1.1] - 2017-05-05

### Added 

- Installation and usage documentation

## [0.1.0] - 2017-05-03

### Added 

- Search Module for delivering K-Search results based on keywords
