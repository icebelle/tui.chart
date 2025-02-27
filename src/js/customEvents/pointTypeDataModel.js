/**
 * @fileoverview PointTypeDataModel is data mode for point type custom event.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('../helpers/predicate');

var PointTypeDataModel = tui.util.defineClass(/** @lends PointTypeDataModel.prototype */ {
    /**
     * PointTypeDataModel is data mode for point type custom event.
     * @constructs PointTypeDataModel
     * @param {array.<object>} seriesInfos series infos
     */
    init: function(seriesInfos) {
        this.data = this._makeData(seriesInfos);
    },

    /**
     * To make coordinate data about bar type graph
     * @param {array.<array.<object>>} groupBounds group bounds
     * @param {string} chartType chart type
     * @returns {array} coordinate data
     * @private
     */
    _makeRectTypeCoordinateData: function(groupBounds, chartType) {
        return tui.util.map(groupBounds, function(bounds, groupIndex) {
            return tui.util.map(bounds, function(_bound, index) {
                var bound;
                if (!_bound) {
                    return null;
                }

                bound = _bound.end;

                return {
                    sendData: {
                        chartType: chartType,
                        indexes: {
                            groupIndex: groupIndex,
                            index: index
                        },
                        allowNegativeTooltip: true,
                        bound: bound
                    },
                    bound: {
                        left: bound.left,
                        top: bound.top,
                        right: bound.left + bound.width,
                        bottom: bound.top + bound.height
                    }
                };
            });
        });
    },

    /**
     * To make coordinate data about dot type graph
     * @param {array.<array.<object>>} groupPositions group positions
     * @param {string} chartType chart type
     * @returns {array} coordinate data
     * @private
     */
    _makeDotTypeCoordinateData: function(groupPositions, chartType) {
        return tui.util.map(tui.util.pivot(groupPositions), function(positions, groupIndex) {
            return tui.util.map(positions, function(position, index) {
                return {
                    sendData: {
                        chartType: chartType,
                        indexes: {
                            groupIndex: groupIndex,
                            index: index
                        },
                        bound: position
                    },
                    bound: {
                        left: position.left - chartConst.DOT_RADIUS,
                        top: position.top - chartConst.DOT_RADIUS,
                        right: position.left + chartConst.DOT_RADIUS,
                        bottom: position.top + chartConst.DOT_RADIUS
                    }
                };
            });
        });
    },

    /**
     * To join data.
     * @param {array.<array.<array.<object>>>} groupData group data
     * @returns {array.<array.<object>>} joined data
     * @private
     */
    _joinData: function(groupData) {
        var results = [];
        tui.util.forEachArray(groupData, function(coordData) {
            tui.util.forEachArray(coordData, function(data, index) {
                if (!results[index]) {
                    results[index] = [];
                }
                results[index] = results[index].concat(data);
            });
        });

        return results;
    },

    /**
     * To make coordinate data.
     * @param {array.<object>} seriesInfos series infos
     * @returns {array.<array.<object>>} coordinate data
     * @private
     */
    _makeData: function(seriesInfos) {
        var coordinateData;
        seriesInfos.reverse();
        coordinateData = tui.util.map(seriesInfos, function(info) {
            var result;
            if (predicate.isLineTypeChart(info.chartType)) {
                result = this._makeDotTypeCoordinateData(info.data.groupPositions, info.chartType);
            } else {
                result = this._makeRectTypeCoordinateData(info.data.groupBounds, info.chartType);
            }
            return result;
        }, this);
        return this._joinData(coordinateData);
    },

    /**
     * Find tooltip data.
     * @param {number} groupIndex group index
     * @param {number} layerX mouse position x
     * @param {number} layerY mouse position y
     * @returns {object} tooltip data
     */
    findData: function(groupIndex, layerX, layerY) {
        var min = 10000,
            result = null,
            candidates;

        if (groupIndex === -1) {
            return result;
        }

        // layerX, layerY를 포함하는 data 추출
        candidates = tui.util.filter(this.data[groupIndex], function(data) {
            var bound = data && data.bound;
            return bound && bound.left <= layerX && bound.right >= layerX && bound.top <= layerY && bound.bottom >= layerY;
        });

        // 추출된 data 중 top이 layerY와 가장 가까운 data 찾아내기
        tui.util.forEachArray(candidates, function(data) {
            var diff = Math.abs(layerY - data.sendData.bound.top);
            if (min > diff) {
                min = diff;
                result = data.sendData;
            }
        });

        return result;
    }
});

module.exports = PointTypeDataModel;
