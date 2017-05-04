'use strict';

var forEach = require('lodash.foreach');
var Dom = require('./dom.js');

/**
 * Image Lazy Load based on Intersection Observer.
 * 
 * To lazy load an image add the class k-search-js-lazy-image and the URL of the image to load 
 * in the data-src attribute. The image will be applied as a background to the element 
 * with class k-search-js-lazy-image-content
 * 
 * @example
 * var LazyLoad = require('lazyload.js');
 * var lazy = LazyLoad.init();
 * 
 * @uses window
 */
module.exports = (function () {

    /**
     * Is IntersectionObserver supported by the browser?
     * @type {boolean}
     */
    var SUPPORTS_INTERSECTION_OBSERVER = ('IntersectionObserver' in window);
    /**
     * The CSS class to add for image already lazy loaded
     * @type {string}
     */
    var HANDLED_CLASS = 'k-search-js-lazy-image--handled';
    /**
     * The treshold used to accept an intersection with the current visible area
     * @type {number} between 0 and 1
     */
    var THRESHOLD = 0.01;

    /**
     * For Singleton purposes, tells if an instance is already running
     * @type {LazyLoadInternal}
     */
    var _instance = null;

    /**
     * Internal class to handle the real lazy loading
     * @param {Object} config 
     */
    function LazyLoadInternal(config){

        this._count = 0;
        
        this._observer = null;

        this._images = document.querySelectorAll('.k-search-js-lazy-image');

        this.config = config;

        if (!SUPPORTS_INTERSECTION_OBSERVER) {
            this._loadImagesImmediately(this._images);
            return;
        }
        
        this._count = this._images.length;
        this._onIntersection = this._onIntersection.bind(this);
        this._observer = new IntersectionObserver(this._onIntersection, this.config);

        forEach(this._images, function(image) {
            if (image.classList.contains(HANDLED_CLASS)) {
                return;
            }

            this._observer.observe(image);
        });
    }

    LazyLoadInternal.prototype.disconnect = function() {
        if (!this._observer) {
            return;
        }

        this._observer.disconnect();
    }

    LazyLoadInternal.prototype._onIntersection = function(entries) {
        forEach(entries, function(entry) {
            if (entry.intersectionRatio < 0) {
                return;
            }

            this._count--;
            this._observer.unobserve(entry.target);
            this._preloadImage(entry.target);
        }.bind(this));

        if (this._count > 0) {
            return;
        }

        this._observer.disconnect();
    }

    LazyLoadInternal.prototype._preloadImage = function(image) {
        
        var src = image.getAttribute('data-src');
        if (!src) {
            return;
        }
        var preload = new Image();

        preload.src = src;

        preload.onload = function () {
            this._applyImage(image, src);
        }.bind(this);

    }

    LazyLoadInternal.prototype._loadImagesImmediately = function(images) {
        forEach(images, function(image){ 
            this._preloadImage(image);
        }.bind(this));
    }

    LazyLoadInternal.prototype._applyImage = function(img, src) {

        var el = img.querySelector('.k-search-js-lazy-image-content');
        if (!el) {
            return;
        }

        // Prevent this from being lazy loaded a second time.
        Dom.classAdd(img, HANDLED_CLASS);
        el.style.backgroundImage = 'url('+src+')';
        Dom.classAdd(el, 'k-search__result__thumbnail__content--fade-in');
    }


    return {
        init: function(){
            if (_instance) {
                _instance.disconnect();
            }

            _instance = new LazyLoadInternal({
                // If the image gets within 50px in the Y axis, start the download.
                rootMargin: '50px 0px',
                threshold: THRESHOLD
            });
        }
    };

})();