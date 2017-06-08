/*!
 * K-Search Javascript library
 * 
 * License GPLv3
 * @version {VERSION}
 */
'use strict';

import Hogan from 'hogan.js';
import assignIn from 'lodash.assignin';
import EventEmitter from 'eventemitter-light';
import LazyLoad from './utils/lazyload.js';
import Dom from './utils/dom.js';
import Ajax from './utils/ajax.js';
import forEach from 'lodash.foreach';

/**
 * The K-Search
 * 
 * @param {Object} options
 * @return {Object}
 * @global
 */
window.ksearch = function (options) {

    var ee = Object.create(EventEmitter).constructor();

    var defaultOptions = {
        /**
         * The K-Link compatible endpoint to use for searching 
         * @type {string}
         */
        url: null,
        /**
         * The API token to obtain access to the Search
         * @type {string}
         */
        token: null,
        /**
         * Where in the page I should put the K-Search. Default [data-k-search]. If more elements matches on the page only the first one will be used
         * @type {string}
         * @default [data-ksearch]
         */
        selector: '[data-ksearch]',
        /**
         * The display style:
         * - overlay the search box is visible and can expand on top of the other elements of the page when active
         * - embed the search box and the results are visible in a page area and cannot hide other elements already in the page
         * @default overlay
         * @type {string}
         */
        display: 'overlay',
        /**
         * If the search form should be collapsed to use less space on the page
         * @type {boolean}
         * @default false
         */
        collapsed: false,
        /**
         * If the search form can expand beyond its current size. Default true, always true if collapsed === true
         * @type {boolean}
         * @default true
         */
        expandable: true,
        /**
         * The language of the UI
         * @type {string}
         * @default en
         */
        language: 'en',
    };

    /**
     * Store information on available and default SVG icons for documents
     */
    var icons = {
        /**
         * The default icon, in case the documentType is not known to the library
         */
        default: "icon-document",

        /**
         * The map between documentType and icon to use
         */
        available: {
            "archive": "ksearchjs-icon-archive",
            "audio": "ksearchjs-icon-audio",
            "document": "ksearchjs-icon-document",
            "geodata": "ksearchjs-icon-geo",
            "image": "ksearchjs-icon-image",
            "pdf": "ksearchjs-icon-pdf",
            "presentation": "ksearchjs-icon-presentation",
            "spreadsheet": "ksearchjs-icon-spreadsheet",
            "video": "ksearchjs-icon-video",
            "web-page": "ksearchjs-icon-web-page"
        }
    };

    var _options = assignIn(defaultOptions, options);

    if (typeof document.querySelector === undefined) {
        throw new Error("K-Search: Browser not supported.");
    }

    if (!_options.url) {
        throw new Error("K-Search: Url not specified.");
    }

    if (!_options.token) {
        throw new Error("K-Search: API Token/Secret not specified.");
    }

    /**
     * The URL of the API endpoint used to get search results
     * @type {string}
     */
    var SEARCH_ENDPOINT = _options.url + "/search/public/";

    /**
     * UI templates
     */
    var templates = {
        /**
         * Search results template
         */
        results: ' \
  {{#results.numFound}} \
        <div class="k-search__results__info">Found <strong>{{{results.numFound}}}</strong> documents</div> \
        {{#results.items}} \
            <div class="k-search__result k-search-js-lazy-image" data-src="{{{document_descriptor.thumbnailURI}}}"> \
                <a href="{{{document_descriptor.documentURI}}}" class="k-search__result__link" rel="nofollow noopener"> \
                    <span class="k-search__result__icon"> \
                    <svg width=24 height=24 role="img"> \
                        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#{{{document_descriptor.icon}}}"></use> \
                    </svg> \
                    </span> \
                    <span class="k-search__result__thumbnail k-search__result__thumbnail--{{{document_descriptor.documentType}}}"><span class="k-search__result__thumbnail__content k-search-js-lazy-image-content"></span></span> \
                    <span class="k-search__result__title">{{{document_descriptor.title}}}</span> \
                    <span class="k-search__result__info"> \
                        <span class="k-search__result__meta"> \
                            <label>type</label>\
                            {{{document_descriptor.documentType}}} \
                        </span> \
                        <span class="k-search__result__meta"> \
                            <label>language</label>\
                            {{{document_descriptor.language}}} \
                        </span> \
                        <span class="k-search__result__meta"> \
                            <label>added on</label>\
                            {{{document_descriptor.creationDate}}} \
                        </span> \
                        <span class="k-search__result__meta k-search__result__meta--source"> \
                            <label>source</label>\
                            {{{document_descriptor.institutionID}}} \
                        </span> \
                    </span> \
                </a> \
            </div> \
        {{/results.items}} \
        {{#pagination.needed}} \
        <div class="k-search__results__pagination"> \
            {{{pagination.current}}} / {{{pagination.total}}} \
            <div class="k-search__pagination__links"> \
                <a href="ks-page-{{pagination.prev}}" class="k-search__pagination__link {{^pagination.prev}} k-search__pagination__link--disabled {{/pagination.prev}}" data-prev="{{pagination.prev}}">< Prev</a> \
                <a href="ks-page-{{pagination.next}}" class="k-search__pagination__link {{^pagination.next}} k-search__pagination__link--disabled {{/pagination.next}}" data-next="{{pagination.next}}">Next ></a> \
            </div> \
        </div> \
        {{/pagination.needed}} \
  {{/results.numFound}} \
  ',
        /**
         * Search result in case of nothing found
         */
        empty: ' \
    <div class="k-search--title"> \
        <div class="k-search--text"> \
            No results found for <b>"{{{query}}}"</b> \
        </div> \
    </div> \
  ',
        /**
         * Dialog and search result container
         */
        dialog: '<div class="k-search__results" id="k-search__results-simple"></div>',
        /**
         * Search form
         */
        searchBox: ' \
  <form novalidate="novalidate" onsubmit="return false;" role="search" name="klink-search" class="k-search__form {{#state.isCollapsed}}k-search__form--collapsed{{/state.isCollapsed}}"> \
		<div class="k-search__logo" data-action="logo"> \
            <svg width=32 height=32 viewBox="0 0 24 24" role="img" aria-label="K-Search"> \
                <g fill="#fff"><path d="M17.894 16.729c-.107.179-.286.271-.592.271h-3.801c.026 0 .176 0 .308 1h3.281c.152 0 .621-.13.681-.352.035-.13.129-.668.123-.919zM11.193 17H4.62a1.73 1.73 0 0 1-1.729-1.734l.015-12.157c0-.516.317-.85.688-1 .473-.192 1.03-.06 1.537.463.118.122.281.138.402.02.122-.118.109-.306-.008-.428-.681-.704-1.719-.97-2.427-.684C2.499 1.722 2 2.323 2 3.082v12.337C2 16.714 3.322 18 4.62 18h6.725c-.236-1-.14-1-.152-1z"/><path d="M10.496 11.728l.004-.005 4.203-4.2a.306.306 0 0 0 .001-.434.306.306 0 0 0-.434-.001l-4.208 4.206A1.535 1.535 0 1 1 7.89 9.121l6.436-6.433c.831-.83 2.175-1.028 3.006-.198.829.83.727 2.37-.104 3.176L13.435 9.39c-.374.375-.375 1.085-.001 1.461l1.488 1.54c.25-.042.507-.042.767-.042.012 0 .023.014.033.014l-1.853-1.852a.347.347 0 0 1 0-.493l3.902-3.9a2.738 2.738 0 0 0-3.872-3.871l-6.443 6.44a2.153 2.153 0 0 0 0 3.041 2.152 2.152 0 0 0 3.04 0z"/><path d="M12.838 19.807a4.15 4.15 0 0 0 5.094.601l1.918 1.918a1.063 1.063 0 1 0 1.503-1.505l-1.955-1.954a4.149 4.149 0 0 0-.704-4.916 4.144 4.144 0 0 0-5.855.001 4.144 4.144 0 0 0-.001 5.855zm1.106-4.747a2.581 2.581 0 0 1 3.642-.001c.707.708.914 1.728.623 2.619a2.548 2.548 0 0 1-1.438 1.569 2.578 2.578 0 0 1-2.825-.548 2.576 2.576 0 0 1-.002-3.639z"/></g> \
            </svg> \
        </div> \
		</button> \
        <input id="ks" type="text" name="search" placeholder="Search for documents..." autocomplete="off" required="required" class="k-search__input"> \
		<button type="submit" title="Search" class="k-search__submit" > \
            <svg width=14 height=14 role="img" aria-label="Search"> \
               <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ksearchjs-icon-search"></use> \
            </svg> \
        </button> \
		<button type="reset" title="Clear the search current search."  data-action="reset" class="k-search__reset"> \
            <svg width=14 height=14 role="img" aria-label="Reset" data-action="reset"> \
               <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ksearchjs-icon-clear"  data-action="reset"></use> \
			</svg> \
		</button> \
        <button class="k-search__chevron" data-action="expandCollapse">\
          <span class="k-search__chevron__open"><</span><span class="k-search__chevron__close">></span> \
        </button> \
        <div class="k-search__info"> \
            <a href="https://klink.asia" class="k-search__link">K-Link</a> offers you documents<br/>from us and partners. \
        </div> \
 \
        <div class="k-search__dialog" id="k-search__dialog"> \
            {{{dialog}}} \
        </div> \
</form> \
 \
<div class="k-search__icons" style=""> \
	<svg xmlns="http://www.w3.org/2000/svg"> \
		<symbol id="ksearchjs-icon-clear" viewBox="0 0 40 40"><path d="M16.228 20L1.886 5.657 0 3.772 3.772 0l1.885 1.886L20 16.228 34.343 1.886 36.228 0 40 3.772l-1.886 1.885L23.772 20l14.342 14.343L40 36.228 36.228 40l-1.885-1.886L20 23.772 5.657 38.114 3.772 40 0 36.228l1.886-1.885L16.228 20z" fill-rule="evenodd"/></symbol> \
		<symbol id="ksearchjs-icon-search" viewBox="0 0 40 40"><path d="M26.806 29.012a16.312 16.312 0 0 1-10.427 3.746C7.332 32.758 0 25.425 0 16.378 0 7.334 7.333 0 16.38 0c9.045 0 16.378 7.333 16.378 16.38 0 3.96-1.406 7.593-3.746 10.426L39.547 37.34c.607.608.61 1.59-.004 2.203a1.56 1.56 0 0 1-2.202.004L26.807 29.012zm-10.427.627c7.322 0 13.26-5.938 13.26-13.26 0-7.324-5.938-13.26-13.26-13.26-7.324 0-13.26 5.936-13.26 13.26 0 7.322 5.936 13.26 13.26 13.26z" fill-rule="evenodd"/></symbol> \
        <symbol id="ksearchjs-logo" viewBox="0 0 24 24"><g fill="#228AE6"><path d="M17.894 16.729c-.107.179-.286.271-.592.271h-3.801c.026 0 .176 0 .308 1h3.281c.152 0 .621-.13.681-.352.035-.13.129-.668.123-.919zM11.193 17H4.62a1.73 1.73 0 0 1-1.729-1.734l.015-12.157c0-.516.317-.85.688-1 .473-.192 1.03-.06 1.537.463.118.122.281.138.402.02.122-.118.109-.306-.008-.428-.681-.704-1.719-.97-2.427-.684C2.499 1.722 2 2.323 2 3.082v12.337C2 16.714 3.322 18 4.62 18h6.725c-.236-1-.14-1-.152-1z"/><path d="M10.496 11.728l.004-.005 4.203-4.2a.306.306 0 0 0 .001-.434.306.306 0 0 0-.434-.001l-4.208 4.206A1.535 1.535 0 1 1 7.89 9.121l6.436-6.433c.831-.83 2.175-1.028 3.006-.198.829.83.727 2.37-.104 3.176L13.435 9.39c-.374.375-.375 1.085-.001 1.461l1.488 1.54c.25-.042.507-.042.767-.042.012 0 .023.014.033.014l-1.853-1.852a.347.347 0 0 1 0-.493l3.902-3.9a2.738 2.738 0 0 0-3.872-3.871l-6.443 6.44a2.153 2.153 0 0 0 0 3.041 2.152 2.152 0 0 0 3.04 0z"/><path d="M12.838 19.807a4.15 4.15 0 0 0 5.094.601l1.918 1.918a1.063 1.063 0 1 0 1.503-1.505l-1.955-1.954a4.149 4.149 0 0 0-.704-4.916 4.144 4.144 0 0 0-5.855.001 4.144 4.144 0 0 0-.001 5.855zm1.106-4.747a2.581 2.581 0 0 1 3.642-.001c.707.708.914 1.728.623 2.619a2.548 2.548 0 0 1-1.438 1.569 2.578 2.578 0 0 1-2.825-.548 2.576 2.576 0 0 1-.002-3.639z"/></g></symbol> \
        <symbol id="ksearchjs-icon-archive" viewBox="0 0 24 24"><path fill="#F7DE79" d="M2.313 0h19.366a2.312 2.312 0 0 1 2.312 2.311V21.69a2.312 2.312 0 0 1-2.312 2.311H2.313A2.312 2.312 0 0 1 .001 21.69V2.311A2.311 2.311 0 0 1 2.313 0z"/><path fill="#FFF" d="M0 7.658h1.6v2.418H0zM1.6 10.076h1.601v2.419H1.6zM3.2 7.658h1.6v2.418H3.2zM4.8 10.076h1.601v2.419H4.8zM6.4 7.658H8v2.418H6.4zM8 10.076h1.6v2.419H8zM9.6 7.658h1.601v2.418H9.6zM11.2 10.076h1.6v2.419h-1.6zM12.8 7.658h1.601v2.418H12.8zM14.4 10.076H16v2.419h-1.6zM16 7.658h1.6v2.418H16zM17.6 10.076h1.601v2.419H17.6zM19.2 7.658h1.6v2.418h-1.6zM20.8 10.076h1.601v2.419H20.8zM22.4 7.658H24v2.418h-1.6z"/></symbol> \
        <symbol id="ksearchjs-icon-audio" viewBox="0 0 24 24"><path fill="#F693B0" d="M2.31 0H21.69a2.312 2.312 0 0 1 2.31 2.311V21.69a2.312 2.312 0 0 1-2.31 2.311H2.31A2.311 2.311 0 0 1 0 21.69V2.311A2.311 2.311 0 0 1 2.31 0z"/><g transform="matrix(.26458 0 0 .26458 -8.601 16.96)"><path fill="#FFF" d="M79.103-50.552c0 11.516 18.971 19.485 18.971 31 0 4.126-1.451 8.198-3.809 12.036-.458.465-1.093.698-1.727.698-1.181 0-2.359-.639-2.089-1.572 2.362-3.543 3.816-7.323 3.816-11.161 0-6.053-8.626-12.099-15.162-16.462h-1.451v-14.539h1.451z"/><path fill="#FFF" d="M75.349-50.552h3.075c.317 0 .579.262.579.579v46.997a.58.58 0 0 1-.579.579h-3.075a.58.58 0 0 1-.581-.579v-46.997c0-.317.26-.579.581-.579z"/><a transform="matrix(6.54985 0 0 6.54985 -548.804 -42.334)"><path fill="#FFF" d="M94.636 4.743c.635 0 1.236.329 1.236 1.031 0 .817-.635 1.372-1.168 1.689-.408.238-.862.409-1.327.409-.635 0-1.236-.329-1.236-1.032 0-.816.635-1.372 1.168-1.689.409-.238.862-.408 1.327-.408z"/></a></g></symbol> \
        <symbol id="ksearchjs-icon-document" viewBox="0 0 24 24"><path fill="#B4CFFA" d="M2.311 0h19.378A2.312 2.312 0 0 1 24 2.311v19.378A2.312 2.312 0 0 1 21.689 24H2.311A2.311 2.311 0 0 1 0 21.689V2.311A2.311 2.311 0 0 1 2.311 0z"/><path fill="#FFF" d="M4.645 5.941h15.018V7.2H4.645zM4.645 8.625h15.018v1.259H4.645zM4.645 11.309h12.1v1.259h-12.1zM4.74 14.724h15.018v1.259H4.74zM4.74 17.407h12.1v1.26H4.74z"/></symbol> \
        <symbol id="ksearchjs-icon-geo" viewBox="0 0 24 24"><path fill="#AFD6B7" d="M2.31 0h19.38A2.312 2.312 0 0 1 24 2.31V21.69a2.312 2.312 0 0 1-2.31 2.31H2.31A2.312 2.312 0 0 1 0 21.69V2.31A2.313 2.313 0 0 1 2.31 0z"/><path fill="none" stroke="#66AD75" stroke-width=".349" d="M2.293 21.613c6.078-2.38 20.238-2.276 13.063-3.798-13.634-2.891 4.953-1.668 5.972-6.044"/><path fill="#FFF" d="M28.11 1.743s.036-.055.036-.073c0-.027-.018-.04-.036-.04s-.036.013-.036.04c0 .018.036.074.036.074zm-.012-.075a.013.013 0 1 1 .025 0 .013.013 0 0 1-.025 0z"/><path fill="none" stroke="#6A9FF5" stroke-width=".29" stroke-opacity=".502" d="M28.043 1.709c.033.013.058.05.09.06"/></symbol> \
        <symbol id="ksearchjs-icon-georaster" viewBox="0 0 24 24"><path fill="#B4CFFA" d="M2.311 0H21.69a2.312 2.312 0 0 1 2.311 2.311v19.378A2.312 2.312 0 0 1 21.69 24H2.311A2.311 2.311 0 0 1 0 21.689V2.311A2.311 2.311 0 0 1 2.311 0z"/><path fill="#8FB5FA" d="M11.701 3.39h1.93v1.431h-1.93zM14.028 3.39h1.931v1.431h-1.931zM16.355 3.39h1.931v1.431h-1.931zM18.684 3.39h1.93v1.431h-1.93zM4.719 5.218h1.932v1.431H4.719zM7.047 5.218h1.93v1.431h-1.93zM9.374 5.218h1.931v1.431H9.374z"/><path fill="#FFF" d="M11.701 5.218h1.93v1.431h-1.93zM14.028 5.218h1.931v1.431h-1.931zM16.355 5.218h1.931v1.431h-1.931zM18.684 5.218h1.93v1.431h-1.93z"/><path fill="#8FB5FA" d="M4.719 7.046h1.932v1.431H4.719z"/><path fill="#77A6F0" d="M7.047 7.046h1.93v1.431h-1.93z"/><path fill="#FFF" d="M9.374 7.046h1.931v1.431H9.374zM11.701 7.046h1.93v1.431h-1.93zM14.028 7.046h1.931v1.431h-1.931zM16.355 7.046h1.931v1.431h-1.931zM18.684 7.046h1.93v1.431h-1.93z"/><path fill="#8FB5FA" d="M2.393 8.874h1.93v1.431h-1.93z"/><path fill="#77A6F0" d="M4.719 8.874h1.932v1.431H4.719zM7.047 8.874h1.93v1.431h-1.93z"/><path fill="#FFF" d="M9.374 8.874h1.931v1.431H9.374zM11.701 8.874h1.93v1.431h-1.93zM14.028 8.874h1.931v1.431h-1.931zM16.355 8.874h1.931v1.431h-1.931zM18.684 8.874h1.93v1.431h-1.93z"/><path fill="#8FB5FA" d="M2.393 10.702h1.93v1.431h-1.93z"/><path fill="#77A6F0" d="M4.719 10.702h1.932v1.431H4.719zM7.047 10.702h1.93v1.431h-1.93z"/><path fill="#FFF" d="M9.374 10.702h1.931v1.431H9.374zM11.701 10.702h1.93v1.431h-1.93zM14.028 10.702h1.931v1.431h-1.931zM16.355 10.702h1.931v1.431h-1.931z"/><path fill="#77A6F0" d="M18.684 10.702h1.93v1.431h-1.93z"/><path fill="#8FB5FA" d="M2.393 12.53h1.93v1.431h-1.93zM4.719 12.53h1.932v1.431H4.719z"/><path fill="#77A6F0" d="M7.047 12.53h1.93v1.431h-1.93z"/><path fill="#FFF" d="M9.374 12.53h1.931v1.431H9.374zM11.701 12.53h1.93v1.431h-1.93zM14.028 12.53h1.931v1.431h-1.931zM16.355 12.53h1.931v1.431h-1.931z"/><path fill="#77A6F0" d="M18.684 12.53h1.93v1.431h-1.93z"/><path fill="#8FB5FA" d="M2.393 14.358h1.93v1.431h-1.93zM4.719 14.358h1.932v1.431H4.719z"/><path fill="#77A6F0" d="M7.047 14.358h1.93v1.431h-1.93zM9.374 14.358h1.931v1.431H9.374zM11.701 14.358h1.93v1.431h-1.93z"/><path fill="#FFF" d="M14.028 14.358h1.931v1.431h-1.931z"/><path fill="#77A6F0" d="M16.355 14.358h1.931v1.431h-1.931z"/><path fill="#8FB5FA" d="M2.393 16.187h1.93v1.431h-1.93zM4.719 16.187h1.932v1.431H4.719zM7.047 16.187h1.93v1.431h-1.93zM9.374 16.187h1.931v1.431H9.374z"/><path fill="#77A6F0" d="M11.701 16.187h1.93v1.431h-1.93zM14.028 16.187h1.931v1.431h-1.931zM16.355 16.187h1.931v1.431h-1.931z"/><path fill="#8FB5FA" d="M4.719 18.015h1.932v1.431H4.719zM7.047 18.015h1.93v1.431h-1.93zM9.374 18.015h1.931v1.431H9.374zM11.701 18.015h1.93v1.431h-1.93z"/><path fill="#77A6F0" d="M14.028 18.015h1.931v1.431h-1.931zM16.355 18.015h1.931v1.431h-1.931z"/><path fill="#8FB5FA" d="M11.701 19.843h1.93v1.431h-1.93z"/><path fill="#77A6F0" d="M14.028 19.843h1.931v1.431h-1.931z"/></symbol> \
        <symbol id="ksearchjs-icon-image" viewBox="0 0 24 24"><g transform="translate(-4.334 -73.098)"><path fill="#FBC98E" d="M6.645 73.098h19.378a2.312 2.312 0 0 1 2.311 2.311v19.378a2.312 2.312 0 0 1-2.311 2.311H6.645a2.311 2.311 0 0 1-2.311-2.311V75.409a2.31 2.31 0 0 1 2.311-2.311z"/><path fill="#FFF" fill-opacity=".965" d="M5.462 76.397h21.369v9.509c-.001 1.735-6.935 4.504-10.744-.047-3.847-4.128-10.599-1.972-10.625.047v-9.509z"/><circle fill="#FBC98E" cx="23.841" cy="79.326" r="2.094"/><path fill="none" stroke="#000" stroke-width=".103" d="M6.184 77.443"/></g></symbol> \
        <symbol id="ksearchjs-icon-pdf" viewBox="0 0 24 24"><path fill="#F26666" d="M2.31 0h19.38A2.312 2.312 0 0 1 24 2.31V21.69a2.312 2.312 0 0 1-2.31 2.31H2.31A2.312 2.312 0 0 1 0 21.69V2.31A2.311 2.311 0 0 1 2.31 0z"/><g fill="#FFF"><path d="M2.359 15.669V8.331h2.377c.902 0 1.488.037 1.764.11.42.11.771.35 1.055.718.285.369.425.845.425 1.429 0 .451-.082.829-.244 1.136a2.024 2.024 0 0 1-.623.723c-.254.176-.51.292-.77.349-.354.07-.865.105-1.537.105h-.964v2.768H2.359zm1.483-6.097v2.082h.811c.584 0 .975-.038 1.172-.115a.992.992 0 0 0 .463-.36.993.993 0 0 0 .166-.571c0-.267-.078-.487-.234-.661s-.357-.281-.597-.325c-.178-.033-.531-.05-1.066-.05h-.715zM9.193 8.331H11.9c.611 0 1.076.046 1.396.14.43.126.799.352 1.105.676.309.324.541.72.701 1.188.16.469.24 1.047.24 1.735 0 .604-.074 1.124-.225 1.562-.184.534-.445.966-.785 1.296-.258.251-.605.446-1.043.586-.326.104-.764.155-1.311.155H9.193V8.331zm1.481 1.241v4.86h1.107c.412 0 .711-.023.895-.07.24-.06.439-.161.6-.305.158-.144.287-.38.387-.709.1-.328.15-.776.15-1.344s-.051-1.003-.15-1.306c-.1-.304-.24-.541-.42-.711a1.416 1.416 0 0 0-.686-.346c-.207-.046-.613-.07-1.217-.07h-.666zM16.609 15.669V8.331h5.031v1.241h-3.549v1.737h3.063v1.242h-3.063v3.118h-1.482z"/></g></symbol> \
        <symbol id="ksearchjs-icon-presentation" viewBox="0 0 24 24"><path fill="#F5B79F" d="M2.311 0h19.378A2.312 2.312 0 0 1 24 2.311V21.69a2.312 2.312 0 0 1-2.311 2.311H2.311A2.313 2.313 0 0 1 0 21.689V2.311A2.311 2.311 0 0 1 2.311 0z"/><path fill="#FFF" d="M3.697 4.806h13.492v1.021H3.697zM17.186 9.218v4.359h-3.892a3.79 3.79 0 0 0 3.741 3.212A3.788 3.788 0 0 0 20.824 13a3.788 3.788 0 0 0-3.638-3.782zM3.77 9.578h6.905v1.021H3.77zM3.77 12.33h6.905v1.021H3.77zM3.77 15.083h6.905v1.021H3.77z"/></symbol> \
        <symbol id="ksearchjs-icon-spreadsheet" viewBox="0 0 24 24"><path fill="#AFD6B7" d="M2.68 0h18.64C22.801 0 24 1.035 24 2.31v19.38c0 1.275-1.199 2.31-2.68 2.31H2.68C1.2 24 0 22.965 0 21.69V2.31C0 1.035 1.2 0 2.68 0z"/><path fill="#FFF" d="M4.061 4.769h15.601v.88h-15.6zM4.071 7.547h15.603v.88H4.07zM4.066 10.296h15.602v.88H4.066zM4.077 13.073h15.602v.88H4.077zM4.066 15.834h15.602v.879H4.066zM4.077 18.611h15.602v.88H4.077z"/><path fill="#FFF" d="M3.733 4.795h1.02v14.598h-1.02zM9.036 4.857h1.02v14.597h-1.02zM14.195 4.982h1.022v14.596h-1.022zM19.175 4.888h1.02v14.597h-1.02z"/></symbol> \
        <symbol id="ksearchjs-icon-svg" viewBox="0 0 24 24"><path fill="#AFAEF5" d="M2.31 0h19.38A2.312 2.312 0 0 1 24 2.311v19.378A2.312 2.312 0 0 1 21.69 24H2.31A2.312 2.312 0 0 1 0 21.689V2.311A2.313 2.313 0 0 1 2.31 0z"/><g fill="#FFF"><path d="M1.671 13.279l1.441-.141c.087.484.264.84.528 1.066.266.227.623.34 1.074.34.477 0 .836-.1 1.078-.303.242-.201.363-.438.363-.709a.668.668 0 0 0-.152-.441c-.103-.123-.28-.229-.533-.318a17.408 17.408 0 0 0-1.187-.32c-.794-.197-1.352-.439-1.672-.726-.45-.404-.676-.896-.676-1.477 0-.374.105-.723.317-1.048.214-.326.519-.573.918-.744.399-.17.881-.255 1.444-.255.921 0 1.614.202 2.08.606s.71.943.733 1.617l-1.481.065c-.063-.377-.2-.648-.408-.813-.209-.166-.521-.248-.938-.248-.431 0-.768.088-1.012.265a.535.535 0 0 0-.234.455.56.56 0 0 0 .22.445c.187.157.641.321 1.361.491.721.17 1.254.346 1.6.528.346.182.615.43.811.746s.293.704.293 1.169c0 .42-.117.814-.351 1.182s-.563.639-.991.818c-.427.178-.959.268-1.597.268-.928 0-1.64-.215-2.137-.643-.499-.429-.795-1.054-.892-1.875zM10.757 15.666L8.134 8.329H9.74l1.857 5.431 1.797-5.431h1.571l-2.628 7.337h-1.58zM19.135 12.969v-1.236h3.194v2.924c-.311.299-.761.564-1.35.793s-1.186.342-1.789.342c-.768 0-1.437-.16-2.008-.482a3.078 3.078 0 0 1-1.286-1.381 4.47 4.47 0 0 1-.431-1.955c0-.764.16-1.443.48-2.038a3.23 3.23 0 0 1 1.407-1.366c.47-.244 1.056-.366 1.757-.366.911 0 1.622.191 2.135.573.512.382.842.91.988 1.584l-1.472.275c-.104-.36-.298-.645-.583-.853s-.64-.313-1.067-.313c-.647 0-1.162.205-1.544.616-.383.41-.573 1.02-.573 1.827 0 .871.193 1.523.58 1.958.388.436.895.654 1.521.654.311 0 .622-.061.934-.184.313-.121.58-.27.804-.441v-.932h-1.697z"/></g></symbol> \
        <symbol id="ksearchjs-icon-video" viewBox="0 0 24 24"><path fill="#CBA3E2" d="M2.311 0h19.378A2.312 2.312 0 0 1 24 2.311V21.69A2.312 2.312 0 0 1 21.689 24H2.311A2.311 2.311 0 0 1 0 21.69V2.31A2.31 2.31 0 0 1 2.311.001z"/><path fill="#FFF" fill-opacity=".967" d="M15.842 12.182L9.73 7.533l.045 8.794 6.067-4.145z"/><path fill="#FFF" d="M1.149 20.146H3.08v1.432H1.149zM5.01 20.146h1.931v1.432H5.01zM8.871 20.146h1.931v1.432H8.871zM12.731 20.146h1.931v1.432h-1.931zM16.592 20.146h1.931v1.432h-1.931zM1.117 2.06h1.93v1.43h-1.93zM4.977 2.06h1.931v1.43H4.977zM8.838 2.06h1.931v1.43H8.838zM12.699 2.06h1.93v1.43h-1.93zM16.56 2.06h1.931v1.43H16.56zM20.453 20.146h1.93v1.432h-1.93zM20.42 2.06h1.931v1.43H20.42z"/></symbol> \
        <symbol id="ksearchjs-icon-web-page" viewBox="0 0 24 24"><path fill="#93E6F6" d="M2.31 0h19.38A2.312 2.312 0 0 1 24 2.31v19.38A2.312 2.312 0 0 1 21.69 24H2.31A2.312 2.312 0 0 1 0 21.69V2.31A2.313 2.313 0 0 1 2.31 0z"/><path fill="none" stroke="#FFF" stroke-width="1.5" d="M4.13 6.69l2.89-2.891a1.578 1.578 0 0 1 2.228 0l2.891 2.89a1.576 1.576 0 0 1 0 2.229l-2.89 2.89a1.578 1.578 0 0 1-2.229 0l-2.89-2.89a1.574 1.574 0 0 1 0-2.228zM11.811 14.637l2.891-2.89a1.575 1.575 0 0 1 2.227 0l2.891 2.89a1.577 1.577 0 0 1 0 2.229l-2.89 2.89a1.575 1.575 0 0 1-2.228 0l-2.89-2.89a1.577 1.577 0 0 1 0-2.23z"/><path fill="#FFF" d="M10.665 9.015l3.73 3.729a1.062 1.062 0 0 1 0 1.498 1.062 1.062 0 0 1-1.499 0l-3.729-3.73a1.062 1.062 0 0 1 0-1.497 1.062 1.062 0 0 1 1.498 0z"/></symbol> \
	</svg> \
</div> \
  '};

    var module = {

        /**
         * The current search terms
         * @type {string}
         */
        search_terms: null,
        /**
         * the search results
         * @type {array}
         */
        results: null,
        
        /**
         * the pagination information about the current search results
         * @type {Object}
         */
        page: {
            /**
             * The current page number
             * @type {number}
             */
            current: 1,
            /**
             * The previous page number
             * @type {number}
             */
            prev: null,
            /**
             * The next page number
             * @type {number}
             */
            next: null,
            /**
             * The total available pages
             * @type {number}
             */
            total: 1,
            /**
             * The number of results to show on each page
             * @type {number}
             */
            itemsPerPage: 5,
            /**
             * If the pagination area should be visible
             * @type {boolean}
             */
            needed: false
        },
        /**
         * a search is running
         * @type {boolean}
         */
        isSearching: false,
        /**
         * The search input field is in focus 
         * @type {boolean}
         */
        isFocus: false,

        /**
         * The dialog window is showed or hided? 
         * @type {boolean}
         */
        isDialogShowed: false,

        /**
         * If the search box is collapsed
         * @type {boolean}
         */
        isCollapsed: false,

        /**
         * The module options
         * @type {Object}
         */
        options: _options,

        /**
         * the pointer to the interactive areas in the search and results
         * @type {Object}
         */
        elements: {
            /**
             * The container of the search, as expressed by configuration
             * @type {HTMLElement}
             */
            searchBox: document.querySelector(_options.selector),
            /**
             * The search result container
             * @type {HTMLElement}
             */
            searchResults: null,
            /**
             * The search form
             * @type {HTMLElement}
             */
            searchForm: null,
            /**
             * The input field that stores the search terms 
             * @type {HTMLElement}
             */
            searchInput: null,
            /**
             * The dialog that contains the search results
             * @type {HTMLElement}
             */
            dialogBox: null,
        },

        /**
         * The width of the search box
         */
        searchBoxWidth: 200, 
        
        /**
         * The width to apply when the form is in focus 
         * and is expanded
         */
        width: 200

    };

    // the dialog must be expandable if is in collapsed mode
    module.options.expandable = module.options.collapsed ? true : module.options.expandable;
    module.isCollapsed = module.options.collapsed;

    module.searchBoxWidth = module.elements.searchBox.offsetWidth;

    if (module.options.expandable) {
        var desiredWidth = module.searchBoxWidth + module.elements.searchBox.offsetLeft-20;
        module.width = desiredWidth;
    }
    else {
        module.width = module.searchBoxWidth;
    }


    render(module.elements.searchBox, templates.searchBox, { state: module, dialog: templates.dialog });

    /**
     * Get the full results template (templates.results + templates.footer)
     */
    function getResultsTemplate() {

        var compiled = Hogan.compile(templates.results);
        var output = compiled.render({ results: module.results, pagination: module.page });

        return output;

    }

    /**
     * Query the K-Link for searching documents.
     * if the search request completes sucessfully the results are stored in the {module.results} field
     * @param {string} term The search terms
     * @param {Object} options The option parameter to customize the search request
     * @fires {ksearch#update}
     */
    function search(term, options) {

        var ITEMS_PER_PAGE = 5;

        var requestData = { 
            query: term, 
            numResults: ITEMS_PER_PAGE, 
            startResult: options && options.page && options.page > 0 ? ITEMS_PER_PAGE * (options.page - 1) : 0 
        };

        module.isSearching = true;

        Ajax.get(SEARCH_ENDPOINT, module.options.token, requestData).then(function (value) {

            if(value.itemCount > 0){
                forEach(value.items, function(el){
                    var dt = Date.parse(el.document_descriptor.creationDate.substring(0, el.document_descriptor.creationDate.indexOf('T')));

                    el.document_descriptor.documentType = el.document_descriptor.documentType.toLowerCase();
                    el.document_descriptor.creationDate = Date.prototype.toLocaleDateString ? new Date(dt).toLocaleDateString() : new Date(dt).toDateString();
                    el.document_descriptor.icon = icons.available[el.document_descriptor.documentType] || icons.default;
                })
            }

            module.results = value;

            module.page.current = options && options.page && options.page > 0 ? options.page : 1;
            module.page.total = Math.floor(value.numFound / ITEMS_PER_PAGE);
            module.page.needed = module.page.total > 1;
            module.page.prev = module.page.current > 1 ? module.page.current - 1 : null;
            module.page.next = module.page.current < module.page.total ? module.page.current + 1 : null;
            module.isSearching = false;

            ee.emit('update');

        });
    }

    /**
     * Render a template on an element with the given data
     * @param {HTMLElement} el the element in which the template should be rendered
     * @param {string} template the template string
     * @param {object} data the data object to be used for placeholder substitution
     * @return {void}
     */
    function render(el, template, data) {
        var compiled = Hogan.compile(template);
        var output = compiled.render(data);

        el.innerHTML = output;
    }

    /**
     * Show the dialog area that contains the search results area
     */
    function showDialog() {
        if (!module.elements.dialogBox) {
            module.elements.dialogBox = module.elements.searchBox.querySelector(".k-search__dialog");
        }

        Dom.classAdd(module.elements.dialogBox, 'k-search__dialog--show');
        module.isDialogShowed = true;
        Dom.classAdd(module.elements.searchBox, "k-search--status__dialog-open");
    }

    /**
     * Hide the dialog area that contains the search results area
     */
    function hideDialog() {
        if (!module.elements.dialogBox) {
            module.elements.dialogBox = module.elements.searchBox.querySelector(".k-search__dialog");
        }

        Dom.classRemove(module.elements.dialogBox, 'k-search__dialog--show');
        module.isDialogShowed = false;
        Dom.classRemove(module.elements.searchBox, "k-search--status__dialog-open");
    }

    /**
     * Wireup the html elements and their event handlers
     */
    function initialize() {

        module.elements.searchResults = module.elements.searchBox.querySelector("#k-search__results-simple");
        module.elements.searchInput = module.elements.searchBox.querySelector(".k-search__input");
        module.elements.searchForm = module.elements.searchBox.querySelector(".k-search__form");
        module.elements.dialogBox = module.elements.searchBox.querySelector(".k-search__dialog");



        module.elements.searchBox.addEventListener('submit', function (e) {

                e.stopPropagation();
                e.preventDefault();

                if (e.target.toString() === '[object HTMLFormElement]') {
                    search(e.target.ks.value);
                }

            });

        module.elements.searchInput.addEventListener('keyup', function (e) {

            if (e.target.id === 'ks') {

                module.search_terms = e.target.value;

                if (module.search_terms.length >= 3) {
                    search(module.search_terms);
                }
                else {
                    module.results = null;
                    // suggestion(e.target.value);
                    ee.emit('update');
                }
            }

        });

        module.elements.searchInput.addEventListener('focus', function (e) {

            if (e.target.id === 'ks' && module.search_terms && module.search_terms.length >= 3) {
                search(module.search_terms);
                module.isFocus = true;
                ee.emit('update');
            }
            else if(e.target.id === 'ks'){
                module.isFocus = true;
                ee.emit('update');
            }

        });

        module.elements.searchInput.addEventListener('blur', function (e) {

            if (e.target.id === 'ks') {
                module.isFocus = false;
                ee.emit('update');
            }

        });

        module.elements.searchBox.addEventListener('click', function (e) {

            var el = Dom.parentMatching(e.target, '.k-search__reset');

            if (el) {

                if (Dom.data(el, 'action') === 'reset') {
                    e.stopPropagation();
                    e.preventDefault();

                    module.results = null;
                    module.page.current=1;
                    module.page.total=1;
                    module.page.prev=null;
                    module.page.next=null;
                    module.page.needed=false;
                    module.search_terms = null;
                    ee.emit('update');
                    return;
                }


            }

            el = Dom.parentMatching(e.target, '.k-search__logo');

            if (el) {

                if (Dom.data(el, 'action') === 'logo') {
                    e.stopPropagation();
                    e.preventDefault();

                    if (module.options.collapsed) {
                        module.isCollapsed = !module.isCollapsed;
                        if (!module.isCollapsed) {
                            module.elements.searchInput.focus();
                        }
                    }
                    else {
                        module.elements.searchInput.focus();
                    }


                }


            }
            
            el = Dom.parentMatching(e.target, '.k-search__chevron');

            if (el) {

                if (Dom.data(el, 'action') === 'expandCollapse') {
                    e.stopPropagation();
                    e.preventDefault();
                    module.isFocus = !module.isFocus;
                    ee.emit('update');
                    return;
                }

            }

            if(Dom.parentMatching(e.target, '[data-prev]') && module.page.current > 1){
                e.preventDefault();
                e.stopPropagation();
                search(module.search_terms, {page: module.page.current - 1});
            }
            else if(Dom.parentMatching(e.target, '[data-next]') && module.page.current < module.page.total){
                e.preventDefault();
                e.stopPropagation();
                search(module.search_terms, {page: module.page.current + 1});
            }
            else if (e.target.id === 'ks' && !module.isSearching && e.target.value && e.target.value.length >= 3) {
                module.search_terms = e.target.value;
                search(module.search_terms);
            }



        });

        // add the specific display style class based on the display option
        var containerDisplayClass = module.options.display === 'embed' ? 'k-search--embed' : 'k-search--overlay';
        if (!Dom.classContains(module.elements.searchBox, containerDisplayClass)) {
            Dom.classAdd(module.elements.searchBox, containerDisplayClass);
        }

        if (module.options.collapsed) {
            Dom.classAdd(module.elements.searchBox, 'k-search--collapsed');
        }

        // if display === embed ensure that the area for results is expanded
        if (module.options.display === 'embed') {
            module.isDialogShowed = true;
            showDialog();
        }
    }

    /**
     * Renders the UI changes everytime the Update event is raised.
     * 
     * Reflect the changes in the module status on the User Interface
     */
    function updateUI() {

        if (module.results && module.results.numFound > 0) {
            module.elements.searchResults.innerHTML = getResultsTemplate();
            LazyLoad.init();
            Dom.classAdd(module.elements.searchBox, "k-search--has-results");
        }
        else if (module.results && module.results.numFound === 0) {
            render(module.elements.searchResults, templates.empty, { query: module.search_terms });
            LazyLoad.init();
            Dom.classAdd(module.elements.searchBox, "k-search--has-results");
        }
        else {
            Dom.classRemove(module.elements.searchBox, "k-search--has-results");
            module.elements.searchResults.innerHTML = '';
        }

        if (!module.isCollapsed && module.options.display!=='embed' && Dom.classContains(module.elements.searchForm, 'k-search__form--collapsed')) {
            Dom.classRemove(module.elements.searchForm, 'k-search__form--collapsed');
            Dom.classAdd(module.elements.searchForm, "k-search__form--float");
            module.elements.searchForm.style.width = module.width+"px";
        }
        if (module.isCollapsed && module.options.display!=='embed' && !Dom.classContains(module.elements.searchForm, 'k-search__form--collapsed')) {
            Dom.classAdd(module.elements.searchForm, 'k-search__form--collapsed');
            Dom.classRemove(module.elements.searchForm, "k-search__form--float");
            module.elements.searchForm.style.width = "";
        }

        if(module.isFocus){
            Dom.classAdd(module.elements.searchBox, "k-search--focus");
        }
        else {
            Dom.classRemove(module.elements.searchBox, "k-search--focus");
        }

        if(module.isFocus && module.options.expandable && module.options.display!=='embed'){
            Dom.classAdd(module.elements.searchForm, "k-search__form--float");
            module.elements.searchForm.style.width = module.width+"px";
        }
        else if(!module.isFocus && !module.isDialogShowed && module.options.expandable && module.options.display!=='embed'){
            Dom.classRemove(module.elements.searchForm, "k-search__form--float");
            module.elements.searchForm.style.width = "";
            if (module.options.collapsed && !Dom.classContains(module.elements.searchForm, 'k-search__form--collapsed')) {
                Dom.classAdd(module.elements.searchForm, 'k-search__form--collapsed');
            }
        }

        if (!module.results && module.options.display !== 'embed' && module.isDialogShowed) {
            hideDialog();
        }
        else if (module.results && !module.isDialogShowed) {
            showDialog();
        }

    }




    /**
     * Register the updateUI function as update event handler
     */
    ee.on('update', updateUI);


    setTimeout(function () { initialize() }, 10);

    return module;

};

/**
 * To support data- attribute initialization
 * 
 * It search in the page for an element with attribute data-ksearch-auto
 * If available initialize a ksearch by invoking window.ksearch, like a
 * normal Javascript based initialization
 */
(function(){

    var ksearch = document.querySelector('[data-ksearch-auto]');

    if(ksearch){
        var options = {
            token: Dom.data(ksearch, 'token'),
            language: 'en',
            selector: '[data-ksearch-auto]',
            url: Dom.data(ksearch, 'url'),
            display: Dom.data(ksearch, 'display')||'overlay',
            collapsed: Dom.data(ksearch, 'collapsed') ? true : false,
        }

        window.ksearch(options);
    }

})();
