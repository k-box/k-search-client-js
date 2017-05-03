'use strict';

var kebabCase = require('lodash.kebabcase');
var withOut = require('lodash.without');

/**
 * DOM Module.
 * Helpers to interact with the Document Object Model
 */
module.exports = {

    /**
     * Matches a selector against an HTMLElement
     * 
     * @param {HTMLElement} elem The Element to test
     * @param {string} selector The selector to match against elem as a string representation. The selector can be any string that is valid for document.querySelector.
     * @returns {boolean} true if the element would be selected by the specified selector, false otherwise.
     */
    matches: function(elem, selector) {
        if(!elem || !selector){
            return false;
        }
        if (Element.prototype.matches) {
            return elem.matches(selector);
        }

        var _polyfill = Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function () {
                return false;
            };

        return _polyfill.call(elem, selector);
    },

    /**
     * Gets the parent of the element that matches the selector
     * @param {HTMLElement} el The Element to retrieve the parent from
     * @param {string} selector The selector to match against elem as a string representation. The selector can be any string that is valid for document.querySelector.
     * @return {HTMLElement|null} the current element if already matches the selector, the parent element that matches the selector or null if no parent element matches the selector
     */
    parentMatching: function(el, selector) {
        if (this.matches(el, selector)) {
            return el;
        }
        else if (el.parentElement) {
            return this.parentMatching(el.parentElement, selector);
        }
        else {
            return null;
        }
    },


    /**
     * Access the data attributes of an element
     * @param {HTMLElement} el The Element to get data from
     * @param {string} key the attribute key, if the data attribute is "data-hello-world" the key will be "helloWorld"
     * @return {string|null|undefined} the value associated to the key
     */
    data: function(el, key){

        if (el.dataset) {
            // dataset is supported
            return el.dataset[key];
        }

        // bad luck Brian!, no browser support
        return el.getAttribute('data-' + kebabCase(key));
    },

    /**
     * Adds a css class to an element
     * @param {HTMLElement} el The Element to add the class to
     * @param {string} cssClass the css class name to add (without the leading dot)
     */
    classAdd: function(el, cssClass){

        if (el.classList && el.classList.add) {
            // classList is supported
            return el.classList.add(cssClass);
        }

        // bad luck Brian!, no browser support
        var classes = el.getAttribute('class').
            trim().
            split(/\s+/);
        if(classes.indexOf(cssClass) < 0){
            classes.push(cssClass);
        }
        return el.setAttribute('class', classes.join(" "));

    },

    /**
     * Remove a css class from an element
     * @param {HTMLElement} el The Element to remove the class from
     * @param {string} cssClass the css class name to add (without the leading dot)
     */
    classRemove: function(el, cssClass){

        if (el.classList && el.classList.remove) {
            // classList is supported
            return el.classList.remove(cssClass);
        }

        // bad luck Brian!, no browser support
        var classes = el.getAttribute('class').
            trim().
            split(/\s+/);
        var arr = withOut(classes, cssClass);
        return el.setAttribute('class', arr.join(" "));

    },

    /**
     * Verify that an element has a css class
     * @param {HTMLElement} el The Element to remove the class from
     * @param {string} cssClass the css class name to add (without the leading dot)
     */
    classContains: function(el, cssClass){

        if (el.classList && el.classList.contains) {
            // classList is supported
            return el.classList.contains(cssClass);
        }

        // bad luck Brian!, no browser support
        return this.matches(el, "." + cssClass);

    }
}