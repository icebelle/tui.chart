/**
 * @fileoverview DOM Handler.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * DOM Handler.
 * @module domHandler
 */
var domHandler = {
    /**
     * Create element.
     * @memberOf module:domHandler
     * @param {string} tag html tag
     * @param {string} newClass class name
     * @returns {HTMLElement} created element
     */
    create: function(tag, newClass) {
        var el = document.createElement(tag);

        if (newClass) {
            this.addClass(el, newClass);
        }

        return el;
    },

    /**
     * Get class names.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @returns {array} names
     * @private
     */
    _getClassNames: function(el) {
        var className = el.className || '',
            classNames = className && tui.util.isString(className) ? className.split(' ') : [];
        return classNames;
    },

    /**
     * Add css class to target element.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} newClass add class name
     */
    addClass: function(el, newClass) {
        var classNames = this._getClassNames(el),
            index = tui.util.inArray(newClass, classNames);

        if (index > -1) {
            return;
        }

        classNames.push(newClass);
        el.className = classNames.join(' ');
    },

    /**
     * Remove css class from target element.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} rmClass remove class name
     */
    removeClass: function(el, rmClass) {
        var classNames = this._getClassNames(el),
            index = tui.util.inArray(rmClass, classNames);

        if (index === -1) {
            return;
        }

        classNames.splice(index, 1);
        el.className = classNames.join(' ');
    },

    /**
     * Whether class exist or not.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} findClass target css class
     * @returns {boolean} has class
     */
    hasClass: function(el, findClass) {
        var classNames = this._getClassNames(el),
            index = tui.util.inArray(findClass, classNames);
        return index > -1;
    },

    /**
     * Find parent by class name.
     * @memberOf module:domHandler
     * @param {HTMLElement} el target element
     * @param {string} className target css class
     * @param {string} lastClass last css class
     * @returns {HTMLElement} result element
     */
    findParentByClass: function(el, className, lastClass) {
        var parent = el.parentNode;
        if (!parent) {
            return null;
        } else if (this.hasClass(parent, className)) {
            return parent;
        } else if (parent.nodeName === 'BODY' || this.hasClass(parent, lastClass)) {
            return null;
        } else {
            return this.findParentByClass(parent, className, lastClass);
        }
    },

    /**
     * Append child element.
     * @memberOf module:domHandler
     * @param {HTMLElement} container container element
     * @param {HTMLElement} children child element
     */
    append: function(container, children) {
        if (!container || !children) {
            return;
        }
        children = tui.util.isArray(children) ? children : [children];

        tui.util.forEachArray(children, function(child) {
            if (!child) {
                return;
            }
            container.appendChild(child);
        }, this);
    }
};

module.exports = domHandler;
