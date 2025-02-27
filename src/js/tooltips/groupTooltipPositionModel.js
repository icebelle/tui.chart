/**
 * @fileoverview GroupTooltipPositionModel is position model for group tooltip..
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

var GroupTooltipPositionModel = tui.util.defineClass(/** @lends GroupTooltipPositionModel.prototype */ {
    /**
     * GroupTooltipPositionModel is position model for group tooltip.
     * @constructs GroupTooltipPositionModel
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {boolean} isVertical whether vertical or not
     * @param {{align: ?string, position: {left: number, top: number}}} options tooltip options
     */
    init: function(chartDimension, areaBound, isVertical, options) {
        /**
         * chart dimension
         * @type {{width: number, height: number}}
         */
        this.chartDimension = chartDimension;

        /**
         * tooltip area bound
         * @type {{dimension: {width: number, height: number}, position: {left: number, top: number}}}
         */
        this.areaBound = areaBound;

        /**
         * Whether vertical or not
         * @type {boolean}
         */
        this.isVertical = isVertical;

        /**
         * tooltip options
         * @type {{align: ?string, position: {left: number, top: number}}}
         */
        this.options = options;

        /**
         * For caching
         * @type {object}
         */
        this.positions;

        this._setData(chartDimension, areaBound, isVertical, options);
    },

    /**
     * Get horizontal direction.
     * @param {?string} alignOption align option
     * @returns {string} direction
     * @private
     */
    _getHorizontalDirection: function(alignOption) {
        var direction;
        alignOption = alignOption || '';
        if (alignOption.indexOf('left') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_BACKWARD;
        } else if (alignOption.indexOf('center') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_CENTER;
        } else {
            direction = chartConst.TOOLTIP_DIRECTION_FORWARD;
        }
        return direction;
    },

    /**
     * To make vertical data.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {?string} alignOption align option
     * @returns {{
     *      positionType: string, sizeType: string, direction: (string),
     *      areaPosition: number, areaSize: number, chartSize: number,
     *      basePosition: (number)
     * }} vertical data
     * @private
     */
    _makeVerticalData: function(chartDimension, areaBound, alignOption) {
        var hDirection = this._getHorizontalDirection(alignOption);
        return {
            positionType: 'left',
            sizeType: 'width',
            direction: hDirection,
            areaPosition: areaBound.position.left,
            areaSize: areaBound.dimension.width,
            chartSize: chartDimension.width,
            basePosition: chartConst.SERIES_EXPAND_SIZE
        };
    },

    /**
     * Get vertical direction.
     * @param {?string} alignOption align option
     * @returns {string} direction
     * @private
     */
    _getVerticalDirection: function(alignOption) {
        var direction;
        alignOption = alignOption || '';
        if (alignOption.indexOf('top') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_BACKWARD;
        } else if (alignOption.indexOf('bottom') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_FORWARD;
        } else {
            direction = chartConst.TOOLTIP_DIRECTION_CENTER;
        }
        return direction;
    },

    /**
     * To make horizontal data.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {?string} alignOption align option
     * @returns {{
     *      positionType: string, sizeType: string, direction: (string),
     *      areaPosition: number, areaSize: number, chartSize: number,
     *      basePosition: (number)
     * }} vertical data
     * @private
     */
    _makeHorizontalData: function(chartDimension, areaBound, alignOption) {
        var vDirection = this._getVerticalDirection(alignOption);
        return {
            positionType: 'top',
            sizeType: 'height',
            direction: vDirection,
            areaPosition: areaBound.position.top,
            areaSize: areaBound.dimension.height,
            chartSize: chartDimension.height,
            basePosition: 0
        };
    },

    /**
     * Set data.
     * @param {{width: number, height: number}} chartDimension chart dimension
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} areaBound tooltip area bound
     * @param {boolean} isVertical whether vertical or not
     * @param {{align: ?string, position: {left: number, top: number}}} options tooltip options
     * @private
     */
    _setData: function(chartDimension, areaBound, isVertical, options) {
        var verticalData = this._makeVerticalData(chartDimension, areaBound, options.align),
            horizontalData = this._makeHorizontalData(chartDimension, areaBound, options.align);
        if (isVertical) {
            this.mainData = verticalData;
            this.subData = horizontalData;
        } else {
            this.mainData = horizontalData;
            this.subData = verticalData;
        }

        this.positionOption = tui.util.extend({
            left: 0,
            top: 0
        }, options.position);

        this.positions = {};
    },

    /**
     * To calculate main position value.
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {{start: number, end: number}} range range
     * @param {object} data data
     *      @param {string} data.direction direction
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _calculateMainPositionValue: function(tooltipSize, range, data) {
        var isLine = (range.start === range.end),
            padding = isLine ? 9 : 5,
            value = data.basePosition;
        if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value += range.end + padding;
        } else if (data.direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value += range.start - tooltipSize - padding;
        } else if (isLine) {
            value += range.start - tooltipSize / 2;
        } else {
            value += range.start + ((range.end - range.start - tooltipSize) / 2);
        }
        return value;
    },

    /**
     * To calculate sub position value.
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.areaSize tooltip area size (width or height)
     *      @param {string} data.direction direction
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _calculateSubPositionValue: function(tooltipSize, data) {
        var middle = data.areaSize / 2,
            value;
        if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = middle + data.basePosition;
        } else if (data.direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value = middle - tooltipSize + data.basePosition;
        } else {
            value = middle - (tooltipSize / 2) + data.basePosition;
        }
        return value;
    },

    /**
     * To make position value diff.
     * @param {number} value positoin value
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     * @returns {number} diff
     * @private
     */
    _makePositionValueDiff: function(value, tooltipSize, data) {
        return value + data.areaPosition + tooltipSize - data.chartSize;
    },

    /**
     * Adjust backward position value.
     * @param {number} value position value
     * @param {{start: number, end: number}} range range
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _adjustBackwardPositionValue: function(value, range, tooltipSize, data) {
        var changedValue;
        if (value < -data.areaPosition) {
            changedValue = this._calculateMainPositionValue(tooltipSize, range, {
                direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
                basePosition: data.basePosition
            });
            if (this._makePositionValueDiff(changedValue, tooltipSize, data) > 0) {
                value = -data.areaPosition;
            } else {
                value = changedValue;
            }
        }
        return value;
    },

    /**
     * Adjust forward position value.
     * @param {number} value position value
     * @param {{start: number, end: number}} range range
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _adjustForwardPositionValue: function(value, range, tooltipSize, data) {
        var diff = this._makePositionValueDiff(value, tooltipSize, data),
            changedValue;
        if (diff > 0) {
            changedValue = this._calculateMainPositionValue(tooltipSize, range, {
                direction: chartConst.TOOLTIP_DIRECTION_BACKWARD,
                basePosition: data.basePosition
            });
            if (changedValue < -data.areaPosition) {
                value -= diff;
            } else {
                value = changedValue;
            }
        }
        return value;
    },

    /**
     * Adjust main position value
     * @param {number} value position value
     * @param {{start: number, end: number}} range range
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     * @returns {number} position value
     * @private
     */
    _adjustMainPositionValue: function(value, range, tooltipSize, data) {
        if (data.direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value = this._adjustBackwardPositionValue(value, range, tooltipSize, data);
        } else if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = this._adjustForwardPositionValue(value, range, tooltipSize, data);
        } else {
            value = tui.util.max([value, -data.areaPosition]);
            value = tui.util.min([value, data.chartSize - data.areaPosition - tooltipSize]);
        }
        return value;
    },

    /**
     * Adjust sub position value.
     * @param {number} value position value
     * @param {number} tooltipSize tooltip size (width or height)
     * @param {object} data data
     *      @param {number} data.chartSize chart size (width or height)
     *      @param {number} data.areaPosition tooltip area position (left or top)
     *      @param {number} data.basePosition basePosition
     * @returns {number} position value
     * @private
     */
    _adjustSubPositionValue: function(value, tooltipSize, data) {
        if (data.direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = tui.util.min([value, data.chartSize - data.areaPosition - tooltipSize]);
        } else {
            value = tui.util.max([value, -data.areaPosition]);
        }
        return value;
    },

    /**
     * To make caching key.
     * @param {{start: number, end: number}} range range
     * @returns {string} key
     * @private
     */
    _makeCachingKey: function(range) {
        return range.start + '-' + range.end;
    },

    /**
     * Add position option.
     * @param {number} position position
     * @param {string} positionType position type (left or top)
     * @returns {number} position
     * @private
     */
    _addPositionOptionValue: function(position, positionType) {
        return position + this.positionOption[positionType];
    },

    /**
     * To calculate group tooltip position.
     * @param {{width: number, height: number}} tooltipDimension tooltip dimension
     * @param {{start: number, end: number}} range tooltip sector range
     * @returns {{left: number, top: number}} group tooltip position
     */
    calculatePosition: function(tooltipDimension, range) {
        var key = this._makeCachingKey(range),
            main = this.mainData,
            sub = this.subData,
            position = this.positions[key],
            mainPosition, subPosition;

        if (!position) {
            position = {};
            mainPosition = this._calculateMainPositionValue(tooltipDimension[main.sizeType], range, main);
            subPosition = this._calculateSubPositionValue(tooltipDimension[sub.sizeType], sub);

            mainPosition = this._addPositionOptionValue(mainPosition, main.positionType);
            subPosition = this._addPositionOptionValue(subPosition, sub.positionType);

            position[main.positionType] = this._adjustMainPositionValue(mainPosition, range, tooltipDimension[main.sizeType], main);
            position[sub.positionType] = this._adjustSubPositionValue(subPosition, tooltipDimension[sub.sizeType], sub);
            this.positions[key] = position;
        }

        return position;
    },

    /**
     * Update tooltip options for position calculation.
     * @param {{align: ?string, position: {left: number, top: number}}} options tooltip options
     */
    updateOptions: function(options) {
        this.options = options;
        this._setData(this.chartDimension, this.areaBound, this.isVertical, options);
    },

    /**
     * Update tooltip bound for position calculation.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound tooltip area bound
     */
    updateBound: function(bound) {
        this.areaBound = bound;
        this._setData(this.chartDimension, bound, this.isVertical, this.options);
    }
});

module.exports = GroupTooltipPositionModel;
