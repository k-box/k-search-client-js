/*!
 * K-Link Search Javascript library
 * 
 * License disclaimer here
 */
'use strict';

import Hogan from 'hogan.js';
import assignIn from 'lodash.assignin';
import EventEmitter from 'eventemitter-light';
import LazyLoad from './utils/lazyload.js';
import Dom from './utils/dom.js';
import Ajax from './utils/ajax.js';

/**
 * The K-Link Search
 * 
 * @param {Object} options
 * @return {Object}
 * @global
 */
window.klinksearch = function (options) {

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
         * Where in the page I should put the K-Link Search. Default [data-klinksearch]. If more elements matches on the page only the first one will be used
         * @type {string}
         * @default [data-klinksearch]
         */
        selector: '[data-klinksearch]',
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

    var _options = assignIn(defaultOptions, options);

    if (typeof document.querySelector === undefined) {
        throw new Error("K-Link Search: Browser not supported.");
    }

    if (!_options.url) {
        throw new Error("K-Link Search: Url not specified.");
    }

    if (!_options.token) {
        throw new Error("K-Link Search: API Token/Secret not specified.");
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
        footer: '<div class="klinksearch__footer"> \
      Search powered by <a class="klinksearch--logo" href="https://klink.asia">K-Link</a> \
    </div>',
        /**
         * Search results template
         */
        results: ' \
  {{#results.numFound}} \
        <div class="klinksearch__results__info">Found <strong>{{{results.numFound}}}</strong> documents</div> \
        {{#results.items}} \
            <div class="klinksearch__result klinkjs-lazy-image" data-src="{{{thumbnailURI}}}"> \
                <a href="{{{documentURI}}}" class="klinksearch__result__link" rel="nofollow noopener"> \
                    <span class="klinksearch__result__icon"></span> \
                    <span class="klinksearch__result__thumbnail"><span class="klinksearch__result__thumbnail__content klinkjs-lazy-image-content"></span></span> \
                    <span class="klinksearch__result__title">{{{title}}}</span> \
                    <span class="klinksearch__result__info"> \
                        <span class="klinksearch__result__meta"> \
                            {{{language}}} \
                        </span> \
                        <span class="klinksearch__result__meta"> \
                            {{{creationDate}}} \
                        </span> \
                        <span class="klinksearch__result__meta klinksearch__result__meta--source"> \
                            {{{institutionID}}} \
                        </span> \
                    </span> \
                </a> \
            </div> \
        {{/results.items}} \
        {{#pagination.needed}} \
        <div class="klinksearch__results__pagination"> \
            {{{pagination.current}}} / {{{pagination.total}}} \
            <div class="klinksearch__pagination__links"> \
                <a href="ks-page-{{pagination.prev}}" class="klinksearch__pagination__link {{^pagination.prev}} klinksearch__pagination__link--disabled {{/pagination.prev}}" data-prev="{{pagination.prev}}">< Prev</a> \
                <a href="ks-page-{{pagination.next}}" class="klinksearch__pagination__link {{^pagination.next}} klinksearch__pagination__link--disabled {{/pagination.next}}" data-next="{{pagination.next}}">Next ></a> \
            </div> \
        </div> \
        {{/pagination.needed}} \
  {{/results.numFound}} \
  ',
        /**
         * Search result in case of nothing found
         */
        empty: ' \
    <div class="klinksearch--title"> \
        <div class="klinksearch--text"> \
            No results found for <b>"{{{query}}}"</b> \
        </div> \
    </div> \
  ',
        /**
         * Dialog and search result container
         */
        dialog: '<div class="klinksearch__info"> \
        <a href="https://klink.asia" class="klinksearch__link">K-Link</a> offers you documents from us and partners. \
    </div> \
    <div class="klinksearch__results" id="klinksearch__results-simple"></div>',
        /**
         * Search form
         */
        searchBox: ' \
  <form novalidate="novalidate" onsubmit="return false;" role="search" name="klink-search" class="klinksearch__form {{#state.isCollapsed}}klinksearch__form--collapsed{{/state.isCollapsed}}"> \
		<div class="klinksearch__logo" data-action="logo"> \
            <svg width=32 height=32 role="img" aria-label="K-Link Search"> \
                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sbx-logo" data-action="logo"></use> \
            </svg> \
        </div> \
		</button> \
        <input id="ks" type="text" name="search" placeholder="Search for documents..." autocomplete="off" required="required" class="klinksearch__input"> \
		<button type="submit" title="Search" class="klinksearch__submit" > \
            <svg width=14 height=14 role="img" aria-label="Search"> \
               <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sbx-icon-search-13"></use> \
            </svg> \
        </button> \
		<button type="reset" title="Clear the search current search."  data-action="reset" class="klinksearch__reset"> \
            <svg width=14 height=14 role="img" aria-label="Reset" data-action="reset"> \
               <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sbx-icon-clear-3"  data-action="reset"></use> \
			</svg> \
		</button> \
 \
        <div class="klinksearch__dialog" id="klinksearch__dialog"> \
            {{{dialog}}} \
        </div> \
</form> \
 \
<div class="klinksearch__icons" style=""> \
	<svg xmlns="http://www.w3.org/2000/svg"> \
		<symbol id="sbx-icon-clear-3" viewBox="0 0 40 40"><path d="M16.228 20L1.886 5.657 0 3.772 3.772 0l1.885 1.886L20 16.228 34.343 1.886 36.228 0 40 3.772l-1.886 1.885L23.772 20l14.342 14.343L40 36.228 36.228 40l-1.885-1.886L20 23.772 5.657 38.114 3.772 40 0 36.228l1.886-1.885L16.228 20z" fill-rule="evenodd"/></symbol> \
		<symbol id="sbx-icon-search-13" viewBox="0 0 40 40"><path d="M26.806 29.012a16.312 16.312 0 0 1-10.427 3.746C7.332 32.758 0 25.425 0 16.378 0 7.334 7.333 0 16.38 0c9.045 0 16.378 7.333 16.378 16.38 0 3.96-1.406 7.593-3.746 10.426L39.547 37.34c.607.608.61 1.59-.004 2.203a1.56 1.56 0 0 1-2.202.004L26.807 29.012zm-10.427.627c7.322 0 13.26-5.938 13.26-13.26 0-7.324-5.938-13.26-13.26-13.26-7.324 0-13.26 5.936-13.26 13.26 0 7.322 5.936 13.26 13.26 13.26z" fill-rule="evenodd"/></symbol> \
        <symbol id="sbx-logo" viewBox="0 0 24 24"><g fill="#228AE6"><path d="M17.894 16.729c-.107.179-.286.271-.592.271h-3.801c.026 0 .176 0 .308 1h3.281c.152 0 .621-.13.681-.352.035-.13.129-.668.123-.919zM11.193 17H4.62a1.73 1.73 0 0 1-1.729-1.734l.015-12.157c0-.516.317-.85.688-1 .473-.192 1.03-.06 1.537.463.118.122.281.138.402.02.122-.118.109-.306-.008-.428-.681-.704-1.719-.97-2.427-.684C2.499 1.722 2 2.323 2 3.082v12.337C2 16.714 3.322 18 4.62 18h6.725c-.236-1-.14-1-.152-1z"/><path d="M10.496 11.728l.004-.005 4.203-4.2a.306.306 0 0 0 .001-.434.306.306 0 0 0-.434-.001l-4.208 4.206A1.535 1.535 0 1 1 7.89 9.121l6.436-6.433c.831-.83 2.175-1.028 3.006-.198.829.83.727 2.37-.104 3.176L13.435 9.39c-.374.375-.375 1.085-.001 1.461l1.488 1.54c.25-.042.507-.042.767-.042.012 0 .023.014.033.014l-1.853-1.852a.347.347 0 0 1 0-.493l3.902-3.9a2.738 2.738 0 0 0-3.872-3.871l-6.443 6.44a2.153 2.153 0 0 0 0 3.041 2.152 2.152 0 0 0 3.04 0z"/><path d="M12.838 19.807a4.15 4.15 0 0 0 5.094.601l1.918 1.918a1.063 1.063 0 1 0 1.503-1.505l-1.955-1.954a4.149 4.149 0 0 0-.704-4.916 4.144 4.144 0 0 0-5.855.001 4.144 4.144 0 0 0-.001 5.855zm1.106-4.747a2.581 2.581 0 0 1 3.642-.001c.707.708.914 1.728.623 2.619a2.548 2.548 0 0 1-1.438 1.569 2.578 2.578 0 0 1-2.825-.548 2.576 2.576 0 0 1-.002-3.639z"/></g></symbol> \
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
        }

    };

    // the dialog must be expandable if is in collapsed mode
    module.options.expandable = module.options.collapsed ? true : module.options.expandable;
    module.isCollapsed = module.options.collapsed;

    render(module.elements.searchBox, templates.searchBox, { state: module, dialog: templates.dialog });

    /**
     * Get the full results template (templates.results + templates.footer)
     */
    function getResultsTemplate() {

        var compiled = Hogan.compile(templates.results);
        var footer = templates.footer;
        var output = compiled.render({ results: module.results, pagination: module.page });

        return output + footer;

    }

    /**
     * Query the K-Link for searching documents.
     * if the search request completes sucessfully the results are stored in the {module.results} field
     * @param {string} term The search terms
     * @param {Object} options The option parameter to customize the search request
     * @fires {KlinkSearch#update}
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
            module.elements.dialogBox = module.elements.searchBox.querySelector(".klinksearch__dialog");
        }

        Dom.classAdd(module.elements.dialogBox, 'klinksearch__dialog--show');
        module.isDialogShowed = true;
        Dom.classAdd(module.elements.searchBox, "klinksearch--status__dialog-open");
    }

    /**
     * Hide the dialog area that contains the search results area
     */
    function hideDialog() {
        if (!module.elements.dialogBox) {
            module.elements.dialogBox = module.elements.searchBox.querySelector(".klinksearch__dialog");
        }

        Dom.classRemove(module.elements.dialogBox, 'klinksearch__dialog--show');
        module.isDialogShowed = false;
        Dom.classRemove(module.elements.searchBox, "klinksearch--status__dialog-open");
    }

    /**
     * Wireup the html elements and their event handlers
     */
    function initialize() {

        module.elements.searchResults = module.elements.searchBox.querySelector("#klinksearch__results-simple");
        module.elements.searchInput = module.elements.searchBox.querySelector(".klinksearch__input");
        module.elements.searchForm = module.elements.searchBox.querySelector(".klinksearch__form");
        module.elements.dialogBox = module.elements.searchBox.querySelector(".klinksearch__dialog");



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

            var el = Dom.parentMatching(e.target, '.klinksearch__reset');

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
                }


            }

            el = Dom.parentMatching(e.target, '.klinksearch__logo');

            if (el) {

                if (Dom.data(el, 'action') === 'logo') {
                    e.stopPropagation();
                    e.preventDefault();

                    if (module.options.collapsed) {
                        module.isCollapsed = !module.isCollapsed;
                        ee.emit('update');
                        if (!module.isCollapsed) {
                            module.elements.searchInput.focus();
                        }
                    }
                    else {
                        module.elements.searchInput.focus();
                    }


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
        var containerDisplayClass = module.options.display === 'embed' ? 'klinksearch--embed' : 'klinksearch--overlay';
        if (!Dom.classContains(module.elements.searchBox, containerDisplayClass)) {
            Dom.classAdd(module.elements.searchBox, containerDisplayClass);
        }

        if (module.options.collapsed) {
            Dom.classAdd(module.elements.searchBox, 'klinksearch--collapsed');
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
            Dom.classAdd(module.elements.searchBox, "klinksearch--has-results");
        }
        else if (module.results && module.results.numFound === 0) {
            render(module.elements.searchResults, templates.empty, { query: module.search_terms });
            LazyLoad.init();
            Dom.classAdd(module.elements.searchBox, "klinksearch--has-results");
        }
        else {
            Dom.classRemove(module.elements.searchBox, "klinksearch--has-results");
            module.elements.searchResults.innerHTML = '';
        }

        if (!module.isCollapsed && module.options.display!=='embed' && Dom.classContains(module.elements.searchForm, 'klinksearch__form--collapsed')) {
            Dom.classRemove(module.elements.searchForm, 'klinksearch__form--collapsed');
            Dom.classAdd(module.elements.searchForm, "klinksearch__form--float");
        }
        if (module.isCollapsed && module.options.display!=='embed' && !Dom.classContains(module.elements.searchForm, 'klinksearch__form--collapsed')) {
            Dom.classAdd(module.elements.searchForm, 'klinksearch__form--collapsed');
            Dom.classRemove(module.elements.searchForm, "klinksearch__form--float");
        }

        if(module.isFocus && module.options.expandable && module.options.display!=='embed'){
            Dom.classAdd(module.elements.searchForm, "klinksearch__form--float");
        }
        else if(!module.isFocus && !module.isDialogShowed && module.options.expandable && module.options.display!=='embed'){
            Dom.classRemove(module.elements.searchForm, "klinksearch__form--float");
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
 * It search in the page for an element with attribute data-klinksearch-auto
 * If available initialize a klinksearch by invoking window.klinksearch, like a
 * normal Javascript based initialization
 */
(function(){

    var klinksearch = document.querySelector('[data-klinksearch-auto]');

    if(klinksearch){
        var options = {
            token: Dom.data(klinksearch, 'token'),
            language: 'en',
            selector: '[data-klinksearch-auto]',
            url: Dom.data(klinksearch, 'url'),
            display: Dom.data(klinksearch, 'display')||'overlay',
            collapsed: Dom.data(klinksearch, 'collapsed') ? true : false,
        }

        window.klinksearch(options);
    }

})();
