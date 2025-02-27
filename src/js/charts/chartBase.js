/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    dataConverter = require('../helpers/dataConverter'),
    boundsMaker = require('../helpers/boundsMaker'),
    UserEventListener = require('../helpers/userEventListener');

var ChartBase = tui.util.defineClass(/** @lends ChartBase.prototype */ {
    /**
     * Chart base.
     * @constructs ChartBase
     * @param {object} params parameters
     *      @param {object} params.bounds chart bounds
     *      @param {object} params.theme chart theme
     *      @param {{yAxis: obejct, xAxis: object}} axesData axes data
     *      @param {object} params.options chart options
     *      @param {boolean} param.isVertical whether vertical or not
     */
    init: function(params) {
        /**
         * converted data
         * @type {object}
         */
        this.convertedData = this._makeConvertedData(params);

        /**
         * component array
         * @type {array}
         */
        this.components = [];

        /**
         * component instance map
         * @type {object}
         */
        this.componentMap = {};

        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme;

        /**
         * options
         * @type {object}
         */
        this.options = params.options;

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;

        /**
         * whether vertical or not
         * @type {boolean}
         */
        this.isVertical = !!params.isVertical;

        /**
         * whether chart has group tooltip or not
         * @type {*|boolean}
         */
        this.hasGroupTooltip = params.options.tooltip && params.options.tooltip.grouped;

        /**
         * user event listener
         * @type {object}
         */
        this.userEvent = new UserEventListener();

        this.chartType = this.options.chartType;

        this._addCustomEventComponent();
    },

    /**
     * To make converted data.
     * @param {object} params parameters
     *      @params {object} userData user data
     *      @params {{chart: object, chartType: string}} options chart options
     *      @params {array} seriesChartTypes series chart types
     * @returns {object} converted data
     * @private
     */
    _makeConvertedData: function(params) {
        var options = params.options,
            convertedData = dataConverter.convert(params.userData, options.chart, options.chartType, params.seriesChartTypes);
        return convertedData;
    },

    /**
     *
     * @private
     * @abastract
     */
    _addCustomEventComponent: function() {},

    /**
     * To add component.
     * The component refers to a component of the chart.
     * The component types are axis, legend, plot, series and customEvent.
     * Chart Component Description : https://i-msdn.sec.s-msft.com/dynimg/IC267997.gif
     * @param {string} name component name
     * @param {function} Component component function
     * @param {object} params parameters
     * @private
     */
    _addComponent: function(name, Component, params) {
        var commonParams = {},
            options, index, theme, component;

        params = params || {};

        options = params.options || this.options[params && params.componentType || name];
        theme = params.theme || this.theme[params && params.componentType || name];
        index = params && params.index || 0;

        commonParams.theme = tui.util.isArray(theme) ? theme[index] : theme;
        commonParams.options = tui.util.isArray(options) ? options[index] : options || {};

        params = tui.util.extend(params, commonParams);

        component = new Component(params);

        this.components.push({
            name: name,
            componentType: params.componentType,
            instance: component
        });
        this.componentMap[name] = component;
    },

    /**
     * To make bounds.
     * @param {object} boundsParams parameters for making bounds
     * @returns {object} chart bounds
     * @private
     */
    _makeBounds: function(boundsParams) {
        return boundsMaker.make(tui.util.extend({
            convertedData: this.convertedData,
            theme: this.theme,
            options: this.options,
            hasAxes: this.hasAxes,
            isVertical: this.isVertical
        }, boundsParams));
    },

    /**
     * To make rendering data for axis type chart.
     * @param {object} bounds chart bounds
     * @param {object} convertedData convertedData
     * @param {object} options options
     * @private
     * @abstract
     */
    _makeRenderingData: function() {},

    /**
     * Attach custom evnet.
     * @private
     * @abstract
     */
    _attachCustomEvent: function() {},

    /**
     * Render chart.
     * @param {object} boundsParams parameters for making bounds
     * @returns {HTMLElement} chart element
     */
    render: function(boundsParams) {
        var el = dom.create('DIV', this.className),
            bounds, renderingData;

        if (boundsParams) {
            this._makeBounds = tui.util.bind(this._makeBounds, this, boundsParams);
        }

        dom.addClass(el, 'tui-chart');
        bounds = this._makeBounds();
        renderingData = this._makeRenderingData(bounds, this.convertedData, this.options);

        this._renderTitle(el);
        renderUtil.renderDimension(el, bounds.chart.dimension);
        renderUtil.renderBackground(el, this.theme.chart.background);
        renderUtil.renderFontFamily(el, this.theme.chart.fontFamily);
        this._renderComponents(el, this.components, bounds, renderingData);
        this._sendSeriesData();
        this._attachCustomEvent();
        this.elChart = el;

        return el;
    },

    /**
     * Render title.
     * @param {HTMLElement} el target element
     * @private
     */
    _renderTitle: function(el) {
        var chartOptions = this.options.chart || {},
            elTitle = renderUtil.renderTitle(chartOptions.title, this.theme.title, 'tui-chart-title');
        dom.append(el, elTitle);
    },

    /**
     * Find bound about component
     * @param {object} bounds components bounds
     * @param {string} name component name
     * @param {string} componentType component type
     * @returns {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} found bound
     * @private
     */
    _findBound: function(bounds, name, componentType) {
        return bounds[name] || (componentType && bounds[componentType]);
    },

    /**
     * Render components.
     * @param {HTMLElement} container container element
     * @param {array.<object>} components components
     * @param {array.<object>} bounds bounds
     * @param {object} renderingData data for rendering
     * @private
     */
    _renderComponents: function(container, components, bounds, renderingData) {
        var elements;
        elements = tui.util.map(components, function(component) {
            var name = component.name,
                bound = this._findBound(bounds, name, component.componentType),
                data = renderingData[name],
                elComponent;
            if (!bound) {
                return null;
            }

            elComponent = component.instance.render(bound, data);

            return elComponent;
        }, this);
        dom.append(container, elements);
    },

    /**
     * Send series data to custom event component.
     * @private
     */
    _sendSeriesData: function() {
        var seriesInfos, chartTypes;

        if (!this.componentMap.customEvent) {
            return;
        }

        chartTypes = this.chartTypes || [this.chartType];
        seriesInfos = tui.util.map(chartTypes, function(chartType) {
            var key = chartTypes.length === 1 ? 'series' : chartType + 'Series';
            return {
                chartType: chartType,
                data: this.componentMap[key].getSeriesData()
            };
        }, this);
        this.componentMap.customEvent.initCustomEventData(seriesInfos);
    },

    /**
     * To make event name for animation.
     * @param {string} chartType chart type
     * @param {string} prefix prefix
     * @returns {string} event name
     * @private
     */
    _makeAnimationEventName: function(chartType, prefix) {
        return prefix + chartType.substring(0, 1).toUpperCase() + chartType.substring(1) + 'Animation';
    },

    /**
     * Animate chart.
     */
    animateChart: function() {
        tui.util.forEachArray(this.components, function(component) {
            if (component.instance.animateComponent) {
                component.instance.animateComponent();
            }
        });
    },

    /**
     * To register of user event.
     * @param {string} eventName event name
     * @param {function} func event callback
     */
    on: function(eventName, func) {
        this.userEvent.register(eventName, func);
    },

    /**
     * Update dimension.
     * @param {{width: number, height: number}} dimension dimension
     * @returns {boolean} whether changed or not
     * @private
     */
    _updateDimension: function(dimension) {
        var changed = false;
        if (dimension.width) {
            this.options.chart.width = dimension.width;
            changed = true;
        }

        if (dimension.height) {
            this.options.chart.height = dimension.height;
            changed = true;
        }

        return changed;
    },

    /**
     * Resize components.
     * @param {array.<{name: string, instance: object}>} components components
     * @param {array.<object>} bounds bounds
     * @param {object} renderingData data for rendering
     * @private
     */
    _resizeComponents: function(components, bounds, renderingData) {
        tui.util.forEachArray(components, function(component) {
            var name = component.name,
                bound = this._findBound(bounds, name, component.componentType),
                data = renderingData[name];

            if (!component.instance.resize) {
                return;
            }

            component.instance.resize(bound, data);
        }, this);
    },

    /**
     * Public API for resizable.
     * @param {{width: number, height: number}} dimension dimension
     */
    resize: function(dimension) {
        var changed, bounds, renderingData;

        if (!dimension) {
            return;
        }

        changed = this._updateDimension(dimension);

        if (!changed) {
            return;
        }

        bounds = this._makeBounds();

        renderingData = this._makeRenderingData(bounds, this.convertedData, this.options);
        renderUtil.renderDimension(this.elChart, bounds.chart.dimension);
        this._resizeComponents(this.components, bounds, renderingData);
        this._sendSeriesData();
    },

    /**
     * Set tooltip align option.
     * @param {string} align align
     */
    setTooltipAlign: function(align) {
        this.componentMap.tooltip.setAlign(align);
    },

    /**
     * Set position option.
     * @param {{left: number, top: number}} position moving position
     */
    setTooltipPosition: function(position) {
        this.componentMap.tooltip.setPosition(position);
    },

    /**
     * Reset tooltip align option.
     */
    resetTooltipAlign: function() {
        this.componentMap.tooltip.resetAlign();
    },

    /**
     * Reset tooltip position.
     */
    resetTooltipPosition: function() {
        this.componentMap.tooltip.resetPosition();
    }
});

module.exports = ChartBase;
