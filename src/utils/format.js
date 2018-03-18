'use strict';

var filter = require('lodash.filter');

/**
 * Format module.
 * 
 * Helpers for formatting values and strings
 */
module.exports = {

    /**
     * Returns a human readable representation of bytes
     * 
     * @param {number} the filesize in bytes
     * @return {string} the human readable string
     */
    filesize: function (bytes) {
        var magnitude = 1000; // or 1024 for Kibibyte
        if (Math.abs(bytes) < magnitude) {
            return bytes + ' Byte';
        }
        var suffixes = ['KB', 'MB', 'GB']
        var s = -1;
        do {
            bytes /= magnitude;
            s++;
        } while (Math.abs(bytes) >= magnitude && s < suffixes.length - 1);
        return bytes.toFixed(1) + ' ' + suffixes[s];
    },

    /**
     * Format a human readable duration.
     * 
     * @param {string} the duration formatted as [[[days:]hours:]minutes:]seconds[.milliseconds], e.g. 01:02:03.456789
     * @return {string} the human readable duration in format 01h02m03s
     */
    duration: function (duration) {

        var regex = /(\d+)(?::|\.|$)/g;

        var matches = duration.match(regex);

        if(!matches){
            return duration;
        }
        
        if(matches.length > 1 && duration.indexOf(".") !== -1){
            matches = matches.splice(0,matches.length-1);
        }

        var filtered_matches = filter(matches, function(v){
            return (v !== "0." && v !== "0:");
        });

        var units = [" days", "h", "m", "s"];

        var mapped = [];

        var usable_units = units.splice(units.length - filtered_matches.length);
        
        for (var index = 0; index < filtered_matches.length; index++) {
            mapped.push(filtered_matches[index].replace(/\.|:$/, '').replace(/^0/, '') + usable_units[index]);
        }
        return mapped.join(" ");
    },

    toLocaleDateStringSupportsLocales: function () {
        try {
            new Date().toLocaleDateString('i');
        } catch (e) {
            return e.name === 'RangeError';
        }
        return false;
    },

    /**
     * Format a human readable date.
     * 
     * @param {string} the date in ISO 8601
     * @return {string} the human readable date, in european format
     */
    datetime: function (datetime) {
        var date = new Date(datetime);

        if (typeof date.toLocaleDateString === "function" && this.toLocaleDateStringSupportsLocales()) {
            return date.toLocaleDateString('en');
        }

        return String(
            date.getDate() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCFullYear()
        );
    }
}