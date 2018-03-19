'use strict';

var forEach = require('lodash.foreach');

/**
 * Ajax.
 * 
 * Abstract a bit the AJAX calls to a K-Link API using fetch and Promises.
 * All the calls are JSON based
 */
module.exports = (function(){

    var _fetch = window.fetch || require('./fetch.js');

    /**
     * Verify if the response was completed without errors.
     * If the response was an error or a redirect it throws an error, so 
     * the promise will be rejected
     * @param {Response} response the fetch Response object
     * @return {Response} the fetch Response object
     * @throws {Error} in case the response status code is not between [200, 300)
     */
    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        }
        else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }

    /**
     * Decodes the response from JSON into an object
     * @param {Response} response the fetch Response object
     * @return {Object} the resulting object from the JSON decoding of the response body text
     */
    function parseJSON(response) {
        return response.json ? response.json() : JSON.parse(response);
    }

    /**
     * Inner object to return as the module Public API
     */
    var inner = {

        /**
         * Perform an JSON POST request
         * @param {string} url the URL for the request
         * @param {string} token the token used to authenticate your request
         * @param {object} data the data to send. Currently an object with the `s` attribute is supported
         * @param {function} callback the function to be called in case of a positive response
         * @return {Promise} The Promise of the request to be made. In case of success the promise will be 
         *   resolved with the response data as first parameter, otherwise will be rejected with the error as first parameter
         */
        post: function (url, token, data, compatibility) {

            return _fetch(url, {
                      method: 'POST',
                      headers: {
                          'Authorization': compatibility ? 'token ' + token : 'Bearer ' + token,
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(data)
                   }).
                   then(checkStatus).
                   then(parseJSON);
        },

        /**
         * Perform a JSON GET request
         * @param {string} url the URL for the request
         * @param {string} token the token used to authenticate your request
         * @param {object} data the data to send. Currently an object with the `s` attribute is supported
         * @param {function} callback the function to be called in case of a positive response
         * @return {Promise} The Promise of the request to be made. In case of success the promise will be 
         *   resolved with the response data as first parameter, otherwise will be rejected with the error as first parameter
         */
        get: function (url, token, data, compatibility) {

            var paramString = [];

            forEach(data, function(value, key){
                paramString.push(key+"="+value);
            });

            return _fetch(url + "?" + paramString.join("&"), {
                      method: 'GET',
                      headers: {
                        'Authorization': compatibility ? 'token ' + token : 'Bearer ' + token,
                          'Content-Type': 'application/json'
                      }
                   }).
                   then(checkStatus).
                   then(parseJSON);
        },

    };

    return inner;
})();