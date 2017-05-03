'use strict';

var forEach = require('lodash.foreach');

/**
 * Fetch.
 * 
 * Simplified window.Fetch polyfill inspired by https://github.com/github/fetch
 * 
 * This is not a full Fetch specification polyfill, it only enable to use a 
 * fetch like interface on IE9-11 instead of using directly the XMLHttpRequest object.
 * 
 * @param {string} url The URL of the resource which is being fetched. If the URL has the host of another site, the request is performed in accordance to CORS.
 * @param {Object} options the request options
 * @return {Promise} the promise of a response
 */
module.exports = function (url, options) {

    var Promise = window.Promise;

    if (!Promise) {
        Promise = require('promise-polyfill');
    }


    /**
     * Simulate a Fetch Response
     * @param {*} bodyInit the initial value for the body, will be used for the text property
     * @param {Object} options response options, like status, statusText and headers
     * @return {Response} the response
     */
    function Response(bodyInit, options) {

        var _options = options || {};

        this.type = 'default';
        this.status = 'status' in _options ? _options.status : 200;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = 'statusText' in _options ? _options.statusText : 'OK';
        this.headers = _options.headers || {};
        this.url = _options.url || '';
        this.text = bodyInit;
    }

    /**
     * Parse the response text from JSON
     * @return {Object}
     */
    Response.prototype.json = function(){
      return JSON.parse(this.text);
    }


    // HTTP methods whose capitalization should be normalized
    var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

    /**
     * Normalize HTTP verbs
     * @param {string} method the HTTP verb
     * @return {string} the normalized HTTP verb in uppercase
     */
    function normalizeMethod(method) {
        var upcased = method.toUpperCase()
        return (methods.indexOf(upcased) > -1) ? upcased : method
    }

    /**
     * Parse the XmlHttpRequest response headers into an object
     * @param {string} rawHeaders 
     * @return {Object} an associative objects with header names as key
     */
    function parseHeaders(rawHeaders) {
        var headers = {};

        forEach(rawHeaders.split(/\r?\n/), function(line) {
            var parts = line.split(':')
            var key = parts.shift().trim()
            if (key) {
                var value = parts.join(':').trim()
                headers[key] = value;
            }
        });
        return headers;
    }

    var request = {
        method: normalizeMethod(options.method) || 'GET',
        url: url,
        headers: options.headers || {},
        body: options.body || '',
        credentials: options.credentials || ''
    };

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var options = {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: parseHeaders(xhr.getAllResponseHeaders() || '')
            }
            options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers['X-Request-URL'];
            var body = xhr.responseText;
            resolve(new Response(body, options));
        }

        xhr.onerror = function () {
            reject(new TypeError('Network request failed'));
        }

        xhr.ontimeout = function () {
            reject(new TypeError('Network request failed'));
        }

        xhr.open(request.method, request.url, true);

        if (request.credentials === 'include') {
            xhr.withCredentials = true;
        }

        forEach(request.headers, function (value, name) {
            xhr.setRequestHeader(name, value);
        });

        xhr.send(request.body);

    });

};