/**
 * @fileoverview Raphael line chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineBase = require('./raphaelLineTypeBase'),
    raphaelRenderUtil = require('./raphaelRenderUtil');

var Raphael = window.Raphael,
    ANIMATION_TIME = 700;

/**
 * @classdesc RaphaelLineCharts is graph renderer for line chart.
 * @class RaphaelLineChart
 * @extends RaphaelLineTypeBase
 */
var RaphaelLineChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelLineChart.prototype */ {
    /**
     * Render function of line chart.
     * @param {HTMLElement} container container
     * @param {{groupPositions: array.<array>, dimension: object, theme: object, options: object}} data render data
     * @return {object} paper raphael paper
     */
    render: function(container, data) {
        var dimension = data.dimension,
            groupPositions = data.groupPositions,
            theme = data.theme,
            colors = theme.colors,
            opacity = data.options.hasDot ? 1 : 0,
            groupPaths = this._getLinesPath(groupPositions),
            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),
            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),
            paper, groupLines, tooltipLine, selectionDot, groupDots;

        this.paper = paper = Raphael(container, dimension.width, dimension.height);

        groupLines = this._renderLines(paper, groupPaths, colors);
        tooltipLine = this._renderTooltipLine(paper, dimension.height);
        selectionDot = this._makeSelectionDot(paper);
        groupDots = this._renderDots(paper, groupPositions, colors, borderStyle);

        if (data.options.hasSelection) {
            this.selectionDot = selectionDot;
            this.selectionColor = theme.selectionColor;
        }

        this.borderStyle = borderStyle;
        this.outDotStyle = outDotStyle;
        this.groupPositions = groupPositions;
        this.groupPaths = groupPaths;
        this.groupLines = groupLines;
        this.tooltipLine = tooltipLine;
        this.groupDots = groupDots;
        this.dotOpacity = opacity;

        return paper;
    },

    /**
     * Get lines path.
     * @param {array.<array.<object>>} groupPositions positions
     * @returns {array.<array.<string>>} paths
     * @private
     */
    _getLinesPath: function(groupPositions) {
        var groupPaths = tui.util.map(groupPositions, function(positions) {
            var fromPos = positions[0],
                rest = positions.slice(1);
            return tui.util.map(rest, function(position) {
                var result = this.makeLinePath(fromPos, position);
                fromPos = position;
                return result;
            }, this);
        }, this);
        return groupPaths;
    },

    /**
     * Render lines.
     * @param {object} paper raphael paper
     * @param {array.<array.<string>>} groupPaths paths
     * @param {string[]} colors line colors
     * @param {number} strokeWidth stroke width
     * @returns {array.<array.<object>>} lines
     * @private
     */
    _renderLines: function(paper, groupPaths, colors, strokeWidth) {
        var groupLines = tui.util.map(groupPaths, function(paths, groupIndex) {
            var color = colors[groupIndex] || 'transparent';
            return tui.util.map(paths, function(path) {
                return raphaelRenderUtil.renderLine(paper, path.start, color, strokeWidth);
            }, this);
        }, this);

        return groupLines;
    },

    /**
     * Animate.
     * @param {function} callback callback
     */
    animate: function(callback) {
        var time = ANIMATION_TIME / this.groupLines[0].length,
            that = this,
            startTime = 0;
        this.renderItems(function(dot, groupIndex, index) {
            var line, path;

            if (index) {
                line = that.groupLines[groupIndex][index - 1];
                path = that.groupPaths[groupIndex][index - 1].end;
                that.animateLine(line, path, time, startTime);
                startTime += time;
            } else {
                startTime = 0;
            }

            if (that.dotOpacity) {
                setTimeout(function() {
                    dot.attr(tui.util.extend({'fill-opacity': that.dotOpacity}, that.borderStyle));
                }, startTime);
            }
        });

        if (callback) {
            setTimeout(callback, startTime);
        }
    },

    /**
     * To resize graph of line chart.
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {array.<array.<{left:number, top:number}>>} params.groupPositions group positions
     */
    resize: function(params) {
        var dimension = params.dimension,
            groupPositions = params.groupPositions,
            that = this;

        this.groupPositions = groupPositions;
        this.groupPaths = this._getLinesPath(groupPositions);
        this.paper.setSize(dimension.width, dimension.height);
        this.tooltipLine.attr({top: dimension.height});

        this.renderItems(function(dot, groupIndex, index) {
            var position = groupPositions[groupIndex][index],
                dotAttrs = {
                    cx: position.left,
                    cy: position.top
                },
                line, path;
            if (index) {
                line = that.groupLines[groupIndex][index - 1];
                path = that.groupPaths[groupIndex][index - 1].end;
                line.attr({path: path});
            }

            if (that.dotOpacity) {
                dotAttrs = tui.util.extend({'fill-opacity': that.dotOpacity}, dotAttrs, that.borderStyle);
            }

            dot.attr(dotAttrs);
        });
    }
});

module.exports = RaphaelLineChart;
