/**
 * @fileoverview Raphael bar chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael;

var ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelBarChart is graph renderer for bar, column chart.
 * @class RaphaelBarChart
 */
var RaphaelBarChart = tui.util.defineClass(/** @lends RaphaelBarChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {HTMLElement} container container element
     * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
     * @return {object} paper raphael paper
     */
    render: function(container, data) {
        var groupBounds = data.groupBounds,
            dimension = data.dimension,
            paper, baseParams;

        if (!groupBounds) {
            return null;
        }

        this.paper = paper = Raphael(container, dimension.width, dimension.height);

        baseParams = {
            paper: paper,
            theme: data.theme,
            groupBounds: groupBounds,
            groupValues: data.groupValues,
            chartType: data.chartType
        };

        this._renderBars(baseParams);

        this._renderBarBorders(baseParams);

        this.theme = data.theme;
        this.groupBounds = groupBounds;
        this.chartType = data.chartType;

        return paper;
    },

    /**
     * Render rect
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {string} params.color series color
     *      @param {string} params.borderColor series borderColor
     *      @param {{left: number, top: number, width: number, height: number}} params.bound bound
     * @returns {object} bar rect
     * @private
     */
    _renderBar: function(params) {
        var bound = params.bound,
            rect;
        if (bound.width < 0 || bound.height < 0) {
            return null;
        }

        rect = params.paper.rect(bound.left, bound.top, bound.width, bound.height);
        rect.attr({
            fill: params.color,
            stroke: 'none'
        });

        return rect;
    },

    /**
     * Render bars.
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{colors: string[], singleColors: string[], borderColor: string}} params.theme bar chart theme
     *      @param {array.<array.<{left: number, top:number, width: number, height: number}>>} params.groupBounds bounds
     * @private
     */
    _renderBars: function(params) {
        var singleColors = (params.groupBounds[0].length === 1) && params.theme.singleColors || [],
            colors = params.theme.colors;
        this.groupBars = tui.util.map(params.groupBounds, function(bounds, groupIndex) {
            var singleColor = singleColors[groupIndex];
            return tui.util.map(bounds, function(bound, index) {
                var color, rect, value;

                if (!bound) {
                    return null;
                }

                color = singleColor || colors[index];
                value = params.groupValues[groupIndex][index];

                rect = this._renderBar({
                    paper: params.paper,
                    chartType: params.chartType,
                    color: color,
                    borderColor: params.theme.borderColor,
                    bound: bound.start,
                    value: value
                });

                return {
                    rect: rect,
                    color: color,
                    bound: bound.end,
                    value: value,
                    groupIndex: groupIndex,
                    index: index
                };
            }, this);
        }, this);
    },

    /**
     * To make rect points.
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @returns {{
     *      leftTop: {left: number, top: number},
     *      rightTop: {left: number, top: number},
     *      rightBottom: {left: number, top: number},
     *      leftBottom: {left: number, top: number}
     * }} rect points
     * @private
     */
    _makeRectPoints: function(bound) {
        return {
            leftTop: {
                left: Math.ceil(bound.left),
                top: Math.ceil(bound.top)
            },
            rightTop: {
                left: Math.ceil(bound.left + bound.width),
                top: Math.ceil(bound.top)
            },
            rightBottom: {
                left: Math.ceil(bound.left + bound.width),
                top: Math.ceil(bound.top + bound.height)
            },
            leftBottom: {
                left: Math.ceil(bound.left),
                top: Math.ceil(bound.top + bound.height)
            }
        };
    },

    /**
     * To make top line path.
     * @param {{left: numbrer, top: number}} leftTop left top
     * @param {{left: numbrer, top: number}} rightTop right top
     * @param {string} chartType chart type
     * @param {number} value value
     * @returns {string} top line path
     * @private
     */
    _makeTopLinePath: function(leftTop, rightTop, chartType, value) {
        var cloneLeftTop = tui.util.extend({}, leftTop);
        cloneLeftTop.left -= chartType === 'column' || value < 0 ? 1 : 0;
        return raphaelRenderUtil.makeLinePath(cloneLeftTop, rightTop);
    },

    /**
     * To make border lines paths.
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @returns {{top: string, right: string, bottom: string, left: string}} paths
     * @private
     */
    _makeBorderLinesPaths: function(bound, chartType, value) {
        var points = this._makeRectPoints(bound),
            paths = {};

        if (chartType === 'bar' || value >= 0) {
            paths.top = this._makeTopLinePath(points.leftTop, points.rightTop, chartType, value);
        }

        if (chartType === 'column' || value >= 0) {
            paths.right = raphaelRenderUtil.makeLinePath(points.rightTop, points.rightBottom);
        }

        if (chartType === 'bar' || value < 0) {
            paths.bottom = raphaelRenderUtil.makeLinePath(points.leftBottom, points.rightBottom);
        }

        if (chartType === 'column' || value < 0) {
            paths.left = raphaelRenderUtil.makeLinePath(points.leftTop, points.leftBottom);
        }

        return paths;
    },

    /**
     * Render border lines;
     * @param {object} params parameters
     *      @param {object} params.paper paper
     *      @param {{left: number, top:number, width: number, height: number}} params.bound bar bound
     *      @param {string} params.borderColor border color
     *      @param {string} params.chartType chart type
     *      @param {number} params.value value
     * @returns {object} raphael object
     * @private
     */
    _renderBorderLines: function(params) {
        var borderLinePaths = this._makeBorderLinesPaths(params.bound, params.chartType, params.value),
            lines = {};
        tui.util.forEach(borderLinePaths, function(path, name) {
            lines[name] = raphaelRenderUtil.renderLine(params.paper, path, params.borderColor, 1);
        });
        return lines;
    },

    /**
     * Render bar borders.
     * @param {object} params parameters
     *      @param {object} params.paper raphael paper
     *      @param {{colors: string[], singleColors: string[], borderColor: string}} params.theme bar chart theme
     *      @param {array.<array.<{left: number, top:number, width: number, height: number}>>} params.groupBounds bounds
     * @private
     */
    _renderBarBorders: function(params) {
        var borderColor = params.theme.borderColor;
        if (!borderColor) {
            return;
        }
        this.groupBorders = tui.util.map(params.groupBounds, function(bounds, groupIndex) {
            return tui.util.map(bounds, function(bound, index) {
                var value;

                if (!bound) {
                    return null;
                }

                value = params.groupValues[groupIndex][index];

                return this._renderBorderLines({
                    paper: params.paper,
                    bound: bound.start,
                    borderColor: borderColor,
                    chartType: params.chartType,
                    value: value
                });
            }, this);
        }, this);
    },

    /**
     * Animate rect.
     * @param {object} rect raphael object
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @private
     */
    _animateRect: function(rect, bound) {
        rect.animate({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        }, ANIMATION_TIME);
    },

    /**
     * Animate borders.
     * @param {array.<object>} lines raphael objects
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @private
     */
    _animateBorders: function(lines, bound, chartType, value) {
        var paths = this._makeBorderLinesPaths(bound, chartType, value);
        tui.util.forEach(lines, function(line, name) {
            line.animate({path: paths[name]}, ANIMATION_TIME);
        });
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        tui.util.forEachArray(this.groupBars, function(bars, groupIndex) {
            var borders = this.groupBorders && this.groupBorders[groupIndex];
            tui.util.forEachArray(bars, function(bar, index) {
                var lines = borders && borders[index];
                this._animateRect(bar.rect, bar.bound);
                if (lines) {
                    this._animateBorders(lines, bar.bound, this.chartType, bar.value);
                }
            }, this);
        }, this);

        if (callback) {
            setTimeout(callback, ANIMATION_TIME);
        }
    },

    /**
     * To update rect attribute
     * @param {object} rect raphael object
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @private
     */
    _updateRectAttr: function(rect, bound) {
        rect.attr({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        });
    },

    /**
     * To update borders attribute
     * @param {array.<object>} lines raphael objects
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @private
     */
    _updateBordersAttr: function(lines, bound, chartType, value) {
        var paths = this._makeBorderLinesPaths(bound, chartType, value);
        tui.util.forEach(lines, function(line, name) {
            line.attr({path: paths[name]});
        });
    },

    /**
     * To resize graph of bar type chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {array.<array.<{left:number, top:number, width: number, height: number}>>} params.groupBounds group bounds
     */
    resize: function(params) {
        var dimension = params.dimension,
            groupBounds = params.groupBounds;

        this.groupBounds = groupBounds;
        this.paper.setSize(dimension.width, dimension.height);

        tui.util.forEachArray(this.groupBars, function(bars, groupIndex) {
            var borders = this.groupBorders && this.groupBorders[groupIndex];
            tui.util.forEachArray(bars, function(bar, index) {
                var lines = borders && borders[index],
                    bound = groupBounds[groupIndex][index].end;
                bar.bound = bound;
                this._updateRectAttr(bar.rect, bound);
                if (lines) {
                    this._updateBordersAttr(lines, bound, this.chartType, bar.value);
                }
            }, this);
        }, this);
    },

    /**
     * Change borders color.
     * @param {array.<object>} lines raphael objects
     * @param {borderColor} borderColor border color
     * @private
     */
    _changeBordersColor: function(lines, borderColor) {
        tui.util.forEach(lines, function(line) {
            line.attr({stroke: borderColor});
        });
    },

    /**
     * To change bar color.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} color fill color
     * @param {?string} borderColor stroke color
     * @private
     */
    _changeBarColor: function(indexes, color, borderColor) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            lines;

        bar.rect.attr({
            fill: color
        });

        if (borderColor) {
            lines = this.groupBorders[indexes.groupIndex][indexes.index];
            this._changeBordersColor(lines, borderColor);
        }
    },

    /**
     * Select series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    selectSeries: function(indexes) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            objColor = Raphael.color(bar.color),
            color = this.theme.selectionColor || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, 0.2),
            borderColor = this.theme.borderColor,
            objBorderColor;

        if (borderColor) {
            objBorderColor = Raphael.color(borderColor);
            borderColor = raphaelRenderUtil.makeChangedLuminanceColor(objBorderColor.hex, 0.2);
        }

        this._changeBarColor(indexes, color, borderColor);
    },

    /**
     * Unselect series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    unselectSeries: function(indexes) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            borderColor = this.theme.borderColor;
        this._changeBarColor(indexes, bar.color, borderColor);
    }
});

module.exports = RaphaelBarChart;
