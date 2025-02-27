/**
 * @fileoverview Chart const
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

/**
 * Chart const
 * @readonly
 * @enum {number}
 */
var chartConst = {
    /** tui class names
     * @type {string}
     */
    CLASS_NAME_LEGEND: 'tui-chart-legend',
    /** @type {string} */
    CLASS_NAME_SERIES_LABEL: 'tui-chart-series-label',
    /** @type {string} */
    CLASS_NAME_SERIES_LEGEND: 'tui-chart-series-legend',
    /** chart types
     * @type {string}
     */
    CHART_TYPE_BAR: 'bar',
    /** @type {string} */
    CHART_TYPE_COLUMN: 'column',
    /** @type {string} */
    CHART_TYPE_LINE: 'line',
    /** @type {string} */
    CHART_TYPE_AREA: 'area',
    /** @type {string} */
    CHART_TYPE_COMBO: 'combo',
    /** @type {string} */
    CHART_TYPE_PIE: 'pie',
    /** chart padding */
    CHART_PADDING: 10,
    /** chart default width */
    CHART_DEFAULT_WIDTH: 500,
    /** chart default height */
    CHART_DEFAULT_HEIGHT: 400,
    /** hidden width */
    HIDDEN_WIDTH: 1,
    /** rendered text padding */
    TEXT_PADDING: 2,
    /** series expand size */
    SERIES_EXPAND_SIZE: 10,
    /** series label padding */
    SERIES_LABEL_PADDING: 5,
    /** default font size of title */
    DEFAULT_TITLE_FONT_SIZE: 14,
    /** default font size of axis title */
    DEFAULT_AXIS_TITLE_FONT_SIZE: 10,
    /** default font size of label */
    DEFAULT_LABEL_FONT_SIZE: 12,
    /** default font size of series label */
    DEFAULT_SERIES_LABEL_FONT_SIZE: 11,
    /** @type {string} */
    /** default graph plugin
     * @type {string}
     */
    DEFAULT_PLUGIN: 'raphael',
    /** default tick color
     * @type {string}
     */
    DEFAULT_TICK_COLOR: 'black',
    /** default theme name
     * @type {string}
     */
    DEFAULT_THEME_NAME: 'default',
    /** stacked option types
     * @type {string}
     */
    STACKED_NORMAL_TYPE: 'normal',
    /** @type {string} */
    STACKED_PERCENT_TYPE: 'percent',
    /** empty axis label */
    EMPTY_AXIS_LABEL: '',
    /** angel */
    ANGLE_85: 85,
    ANGLE_90: 90,
    ANGLE_360: 360,
    /** radian */
    RAD: Math.PI / 180,
    /** series legend types
     * @type {string}
     */
    LEGEND_ALIGN_OUTER: 'outer',
    /** @type {string} */
    LEGEND_TYPE_CENTER: 'center',
    /** series outer label padding */
    SERIES_OUTER_LABEL_PADDING: 20,
    /** default rate of pie graph */
    PIE_GRAPH_DEFAULT_RATE: 0.8,
    /** small rate of pie graph */
    PIE_GRAPH_SMALL_RATE: 0.65,
    /** dot radius */
    DOT_RADIUS: 4,
    /** yAxis properties
     * @type {array.<string>}
     */
    YAXIS_PROPS: ['tickColor', 'title', 'label'], // yaxis theme의 속성 - chart type filtering할 때 사용됨
    /** series properties
     * @type {array.<string>}
     */
    SERIES_PROPS: ['label', 'colors', 'borderColor', 'singleColors', 'selectionColor'], // series theme의 속성 - chart type filtering할 때 사용됨
    /** title area width padding */
    TITLE_AREA_WIDTH_PADDING: 20,
    /** top margin of x axis label */
    XAXIS_LABEL_TOP_MARGIN: 10,
    /** right padding of vertical label */
    V_LABEL_RIGHT_PADDING: 10,
    /** tooltip prefix
     * @type {string}
     */
    TOOLTIP_PREFIX: 'tui-chart-tooltip',
    /** minimum pixel type step size */
    MIN_PIXEL_TYPE_STEP_SIZE: 40,
    /** maximum pixel type step size */
    MAX_PIXEL_TYPE_STEP_SIZE: 60,
    /** tick info of percent stacked option
     * @type {object}
     */
    PERCENT_STACKED_TICK_INFO: {
        scale: {
            min: 0,
            max: 100
        },
        step: 25,
        tickCount: 5,
        labels: [0, 25, 50, 75, 100]
    },
    /** title add padding */
    TITLE_PADDING: 20,
    /** legend area padding */
    LEGEND_AREA_PADDING: 10,
    /** legend rect width */
    LEGEND_RECT_WIDTH: 12,
    /** lgend label left padding */
    LEGEND_LABEL_LEFT_PADDING: 5,
    /** AXIS LABEL PADDING */
    AXIS_LABEL_PADDING: 7,
    /** rotations degree candidates */
    DEGREE_CANDIDATES: [25, 45, 65, 85],
    /** xAxis label compare margin */
    XAXIS_LABEL_COMPARE_MARGIN: 20,
    /** xAxis label gutter */
    XAXIS_LABEL_GUTTER: 2,
    /** stand multiple nums of axis */
    AXIS_STANDARD_MULTIPLE_NUMS: [1, 2, 5, 10],
    /** label padding top */
    LABEL_PADDING_TOP: 2,
    /** line margin top */
    LINE_MARGIN_TOP: 5,
    /** tooltip gap */
    TOOLTIP_GAP: 5,
    /** tooltip direction
     * @type {string}
     */
    TOOLTIP_DIRECTION_FORWARD: 'forword',
    /** @type {string} */
    TOOLTIP_DIRECTION_CENTER: 'center',
    /** @type {string} */
    TOOLTIP_DIRECTION_BACKWARD: 'backword',
    /** tooltip align options
     * @type {string}
     */
    TOOLTIP_DEFAULT_ALIGN_OPTION: 'center top',
    /** @type {string} */
    TOOLTIP_DEFAULT_HORIZONTAL_ALIGN_OPTION: 'right middle',
    /** @type {string} */
    TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION: 'right middle',
    /** @type {string} */
    TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION: 'center bottom',
    /** hide delay */
    HIDE_DELAY: 200
};
module.exports = chartConst;
