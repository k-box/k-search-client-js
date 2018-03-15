/**
 * Event Emitter light
 * 
 * @author Jake Verbaten <raynos2@gmail.com>
 * @link https://github.com/Raynos/eventemitter-light
 * @license MIT https://github.com/Raynos/eventemitter-light/blob/master/LICENCE
 */

/* eslint func-names: "off", no-unused-expressions: "off" */

module.exports = {
    /**
     * Register an event handler
     * 
     * @param {string} ev the event name
     * @param {Function} handler the event handler. The handler will receive a variable number of parameters, depending on the event emission
     */
    on: function (ev, handler) {
        var events = this._events

        ;(events[ev] || (events[ev] = [])).push(handler)
    },

    /**
     * Removes a previously registered event handler
     * 
     * @param {string} ev the event name
     * @param {Function} handler the original handler function that must be removed.
     */
    off: function (ev, handler) {
        var array = this._events[ev]

        array && array.splice(array.indexOf(handler), 1)
    },

    /**
     * Emit an event
     * 
     * @param {string} ev the event name
     */
    emit: function (ev) {
        var args = [].slice.call(arguments, 1),
            array = this._events[ev] || []

        for (var i = 0, len = array.length; i < len; i++) {
            array[i].apply(this, args)
        }
    },

    /**
     * Register an event handler that is called only the first time an event is raised
     * 
     * @param {string} ev the event name
     * @param {Function} handler the event handler. The handler will receive a variable number of parameters, depending on the event emission
     */
    once: function (ev, handler) {
        this.on(ev, remover)
        
        /**
         * The handler callback that executes the event handler and then de-register the event handling
         */
        function remover() {
            handler.apply(this, arguments)
            this.off(ev, remover)
        }
    },

    constructor: function constructor() {
        this._events = {}
        return this
    }
}

module.exports.constructor.prototype = module.exports