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

import Client from './k-search-client-module.js';


/**
 * The K-Search
 * 
 * @param {Object} options
 * @return {Object}
 * @global
 */
window.ksearchClient = function (options) {
    return new Client(options);
};
