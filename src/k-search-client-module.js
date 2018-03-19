/*!
 * K-Search Javascript client
 * 
 * Fetches data from a K-Search API Endpoint
 * 
 * License AGPL-3.0
 * @version {VERSION}
 * @author Alessio Vertemati
 */

/* global Promise */
/* eslint no-unused-vars: 'warn' */

'use strict';

var assignIn = require('lodash.assignin');
var Ajax = require('./utils/ajax.js');
var Format = require('./utils/format.js');
var forEach = require('lodash.foreach');
var map = require('lodash.map');
var transform = require('lodash.transform');

/**
 * Create a K-Search Client
 * 
 * @param {Object} options The client configuration options
 * @param {string} options.url The URL of the K-Search
 * @param {string} options.token The authentication token to use
 * @param {boolean} options.compatibility In case is required to use the old authentication protocol
 * @return {KSearchClient}
 */
function KSearchClient(options) {

    var MIME_TYPE_MAPPING = {
		'text/html': 'web-page',
		'application/msword': 'document',
		'application/vnd.ms-excel': 'spreadsheet',
		'application/vnd.ms-powerpoint': 'presentation',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
		'application/pdf': 'document',
		'text/uri-list': 'uri-list',
		'image/jpg': 'image',
		'image/jpeg': 'image',
		'image/gif': 'image',
		'image/png': 'image',
		'image/tiff': 'image',
		'text/plain': 'text-document',
		'application/rtf': 'text-document',
		'text/x-markdown': 'text-document',
		'application/vnd.google-apps.document': 'document',
		'application/vnd.google-apps.drawing': 'image',
		'application/vnd.google-apps.form': 'form',
		'application/vnd.google-apps.fusiontable': 'spreadsheet',
		'application/vnd.google-apps.presentation': 'presentation',
		'application/vnd.google-apps.spreadsheet': 'spreadsheet',
		'application/vnd.google-earth.kml+xml': 'geodata',
		'application/vnd.google-earth.kmz': 'geodata',
        'application/rar': 'archive',
        'application/zip': 'archive',
        'application/x-tar': 'archive',
        'application/x-bzip2': 'archive',
        'application/gzip': 'archive',
        'application/x-gzip': 'archive',
        'application/x-mimearchive': 'web-page',
        'video/x-ms-vob': 'dvd',
        'content/DVD': 'dvd',
        'video/x-ms-wmv': 'video',
        'video/x-ms-wmx': 'video',
        'video/x-ms-wm': 'video',
        'video/avi': 'video',
        'video/divx': 'video',
        'video/x-flv': 'video',
        'video/quicktime': 'video',
        'video/mpeg': 'video',
        'video/mp4': 'video',
        'video/ogg': 'video',
        'video/webm': 'video',
        'video/x-matroska': 'video',
        'video/3gpp': 'video',
        'video/3gpp2': 'video',
        'text/csv': 'spreadsheet',
        'message/rfc822': 'email',
        'application/vnd.ms-outlook': 'email',
    };

    /**
     * Default number of items per-page
     */
    var ITEMS_PER_PAGE = 12;
    
    /**
     * Version of the K-Search API to request
     */
    var SEARCH_API_VERSION = '3.0';
    
    /**
     * The URL of the API. It includes the basic path and the requested API version
     */
    var API_URL = 'api/' + SEARCH_API_VERSION;

    /**
     * K-Search endpoint for performing searches
     */
    var SEARCH_ENDPOINT = 'data.search';

    /**
     * K-Search endpoint for getting a data entry by UUID
     */
    var GET_ENDPOINT = 'data.get';

    var LANGUAGES = {
        "en" : "English",
        "tg" : "Тоҷикӣ (Tajik)",
        "ru" : "Русский (Russian)",
    }

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
         * Consider the API running in compatibility mode with respect to the beta 3.0 release
         * This implies using "Authorization: token" instead of "Authorization: Bearer" header
         * @type {boolean}
         */
        compatibility: false,
    };

    var _options = assignIn(defaultOptions, options);

    if (!_options.url) {
        throw new Error("App: Url not specified.");
    }

    if (!_options.token) {
        throw new Error("App: API Token/Secret not specified.");
    }

    _options.url = _options.url.replace(/\/+$/, ''); // rtrim of slash

    /**
     * Query the K-Link for searching documents.
     * 
     * @param {Object} searchRequest The search request object
     * @return {Promise|SearchResults} the promise of obtaining a SearchResult instance
     */
    function search(searchRequest) {

        var requestData = {
            id: "kscjs-" + new Date().getTime(),
            params: searchRequest,
        };

        return Ajax.post(_options.url + "/" + API_URL + "/" + SEARCH_ENDPOINT, _options.token, requestData, _options.compatibility).
            then(function (response) {

                if (response.error) {
                    throw new Error(response.error.message);
                }

                return new SearchResults(searchRequest, response);
            });
    }

    /**
     * Get a data added to K-Link.
     * 
     * @param {string} uuid The UUID of the data to retrieve
     * @return {Promise|Data} the promise of obtaining a Data instance
     */
    function get(uuid) {

        var requestData = {
            id: "kscjs-" + new Date().getTime(),
            params: {
                uuid: uuid,
            }
        };

        return Ajax.post(_options.url + "/" + API_URL + "/" + GET_ENDPOINT, _options.token, requestData, _options.compatibility).
            then(function (response) {

                if (response.error && response.error.data && response.error.data['params.uuid']) {
                    return null;
                }
                else if (response.error) {
                    throw new Error(response.error.message);
                }

                return new Data(response.result);
            });
    }

    /**
     * Data ViewModel
     * 
     * Abstract a Data entry in the search result list
     * 
     * @param {Data} result 
     */
    function Data(result) {
        this.id = result.uuid;
        this.type = result.type;
        this.isVideo = result.type === 'video';
        this.hasEmbed = false;
        this.embed = null;
        this.mime_type = result.properties.mime_type;
        this.type = MIME_TYPE_MAPPING[result.properties.mime_type] || "unknown";
        this.url = result.url;
        this.title = result.properties.title.replace(/_/g, ' ').replace(/\.[^/.]+$/, ""); // replace underscors and file extension
        this.abstract = result.properties.abstract;
        this.thumbnail = result.properties.thumbnail;
        this.language = LANGUAGES[result.properties.language] || result.properties.language;
        this.created_at = Format.datetime(result.properties.created_at);
        this.authors = map(result.authors || result.author, function (author) {
            return author.name;
        }).join(', ');
        this.source = result.uploader.name;
        this.size = Format.filesize(result.properties.size);
        this.copyright = {
            license: result.copyright.usage.name,
            contact: result.copyright.owner.contact || result.copyright.owner.name + " " + (result.copyright.owner.email || result.copyright.owner.website),
        };

        var streamings = {};

        if (result.properties.video && result.properties.video.streaming && result.properties.video.streaming.length > 0) {
            streamings = transform(result.properties.video.streaming, function (result, stream) {
                result[stream.type] = stream.url;
            }, {});
        }

        this.video = {
            duration: result.properties.video ? Format.duration(result.properties.video.duration) : null,
            streaming: streamings,
        }
        this.audio = {
            languages: result.properties.audio ? map(result.properties.audio, function (audio) {
                return audio.language;
            }).join(', ') : null
        }
        this.raw = result;
    }

    /**
     * Search result ViewModel
     * 
     * Abstract the search result object for the UI
     * 
     * @param {*} request the original search request 
     * @param {*} original the original response coming from the K-Search API
     */
    function SearchResults(request, original) {

        var results = original.result;

        var total_pages = Math.ceil(results.total_matches / results.query.limit) || 1;
        var current = Math.floor(request.offset / request.limit) + 1;

        var items = [];

        forEach(results.items, function (v) {
            items.push(new Data(v));
        })

        this.data = items;
        this.term = request.search;
        this.results = {
            total: results.total_matches
        };
        this.pagination = {
            current: current,
            total: total_pages,
            prev: current > 1 ? Math.max(1, current - 1) : false,
            next: current < total_pages ? Math.min(current + 1, total_pages) : false
        };
    }


    var module = {

        /**
         * Get a single Data by its UUID
         * 
         * @param {String} uuid The UUID of the data to retrieve
         * @return {Data}
         */
        get: function (uuid) {
            return get(uuid).then(function (result) {

                return result;

            });
        },

        /**
         * Grab data from the search by the given UUID
         * 
         * @param {String|Array} uuid The UUIDs of the data to retrieve
         * @return {Array} 
         */
        fetch: function (uuid) {

            return module.find({
                term: "*",
                page: 0,
                limit: typeof uuid === "string" ? 1 : uuid.length,
                filters: typeof uuid === "string" ? "uuid:" + uuid : map(uuid, function (id) {
                    return 'uuid:' + id;
                }).join(' OR ')
            }).then(function (results) {

                return results.data;

            });
        },

        /**
         * Search for data matching the specified request
         * 
         * @param {Object} request The search request with term and page, e.g. {term: "hello", page: 2, limit: 10, filters: 'string'}
         * @param {string} request.term The keywords or phrase to search for
         * @param {number} request.page The result page to retrieve. Default 1
         * @param {number} request.limit The number of result per page. Default ITEMS_PER_PAGE
         * @param {string} request.filters The filter query
         * @return {Promise} The SearchResults
         */
        find: function (request) {
            
            return search({
                search: request.term,
                offset: request.page && request.page > 0 ? ITEMS_PER_PAGE * (request.page - 1) : 0,
                limit: request.limit || ITEMS_PER_PAGE,
                filters: request.filters || ""
            });

        },

        /**
         * Get the amount of published data that respect the given filter
         * 
         * @param {string} filters The filter query. Can be optional, by default the total published data is reported.
         * @return {Promise} The amount of published data
         */
        total: function (filters) {

            return module.find({
                term: "*",
                page: 0,
                limit: 0,
                filters: filters || ""
            }).then(function (results) {

                return results.results.total;

            });
        },

    }

    return module;
};

module.exports = KSearchClient;
