# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/0.3.0/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## Added

## Changed

## Fixed

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
