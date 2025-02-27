/**
 * @fileoverview test bar chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChartSeries = require('../../src/js/series/barChartSeries.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('BarChartSeries', function() {
    var series;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        series = new BarChartSeries({
            chartType: 'bar',
            data: {
                values: [],
                formattedValues: [],
                scale: {min: 0, max: 0}
            },
            bound: {
                dimension: {width: 200, height: 100}
            },
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
                }
            },
            options: {}
        });
    });

    describe('_makeBarChartBound()', function() {
        it('baseBound 정보에 startLeft, endLeft, endWidth정보를 더하여 start, end로 구분된 bound 정보를 생성합니다.', function() {
            var actual = series._makeBarChartBound({
                    baseBound: {
                        top: 10,
                        height: 30
                    },
                    startLeft: 10,
                    endLeft: 10,
                    endWidth: 40
                }),
                expected = {
                    start: {
                        left: 10,
                        top: 10,
                        width: 0,
                        height: 30
                    },
                    end: {
                        left: 10,
                        top: 10,
                        width: 40,
                        height: 30
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalBarChartBound()', function() {
        it('normal bar chart bar 하나의 bound정보를 생성합니다.', function() {
            var actual = series._makeNormalBarChartBound({
                    distanceToMin: 0,
                    dimension: {
                        width: 400,
                        height: 200
                    },
                    step: 40,
                    barSize: 30
                }, 0.3, 10, 0),
                expected = {
                    start: {
                        left: 10,
                        top: 10,
                        width: 0,
                        height: 30
                    },
                    end: {
                        left: 10,
                        top: 10,
                        width: 120,
                        height: 30
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalBarChartBounds()', function() {
        it('percentValues 배열과 동일한 배열 형태로 bounds 정보를 생성합니다.', function () {
            var actual;
            series.percentValues = [[0.2, 0.4, 0.1]];
            actual = series._makeNormalBarChartBounds({
                width: 400,
                height: 200
            }, 1);

            expect(actual.length).toBe(1);
            expect(actual[0].length).toBe(3);
            expect(!!actual[0][0].start).toBe(true);
            expect(!!actual[0][0].end).toBe(true);
        });

        it('값에 음수, 양수 모두가 포함되어 있을 경우 bounds 정보는 0점 기준으로 좌우로 설정됩니다.', function () {
            var result;
            series.percentValues = [[-0.2, 0.4, 0.1]];
            series.data.scale = {
                min: -40,
                max: 60
            };
            result = series._makeNormalBarChartBounds({
                width: 400,
                height: 200
            }, 1);

            // 0점의 위치가 left 170임
            // 음수의 경우 left, width 값이 같이 변함
            expect(result[0][0].start.left).toBe(170);
            expect(result[0][0].start.width).toBe(0);
            expect(result[0][0].end.left).toBe(90);
            expect(result[0][0].end.width).toBe(80);

            // 양수의 경우는 width만 변화됨
            expect(result[0][1].start.left).toBe(170);
            expect(result[0][1].start.width).toBe(0);
            expect(result[0][1].end.left).toBe(170);
            expect(result[0][1].end.width).toBe(160);
        });
    });

    describe('_makeStackedBarChartBounds()', function() {
        it('stacked 옵션이 있는 Bar차트의 bounds 정보는 end.left가 이전 end.width 만큼씩 감소합니다', function () {
            var bounds;
            series.percentValues = [[0.2, 0.3, 0.5]];
            bounds = series._makeStackedBarChartBounds({
                width: 400,
                height: 100
            }, 1);

            expect(bounds[0][0].end.left).toBe(10);
            expect(bounds[0][0].end.width).toBe(80);

            expect(bounds[0][1].end.left).toBe(90);
            expect(bounds[0][1].end.width).toBe(120);

            expect(bounds[0][2].end.left).toBe(210);
            expect(bounds[0][2].end.width).toBe(200);
        });
    });

    describe('_makeBounds()', function() {
        it('stacked 옵션이 없으면 _makeNormalBarChartBounds()가 수행됩니다.', function () {
            var actual, expected;
            series.percentValues = [[0.2, 0.4, 0.1]];
            actual = series._makeBounds({
                width: 400,
                height: 200
            }, 1);
            expected = series._makeNormalBarChartBounds({
                width: 400,
                height: 200
            }, 1);
            expect(actual).toEqual(expected);
        });

        it('stacked 옵션이 있으면 _makeStackedBarChartBounds()가 수행됩니다.', function () {
            var actual, expected;
            series.percentValues = [[0.2, 0.3, 0.5]];
            series.options.stacked = 'normal';
            actual = series._makeBounds({
                width: 400,
                height: 100
            }, 1);
            expected = series._makeStackedBarChartBounds({
                width: 400,
                height: 100
            }, 1);
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSeriesRenderingPosition()', function() {
        it('series label의 렌더링 포지션을 구합니다.', function() {
            var actual = series.makeSeriesRenderingPosition({
                    value: 10,
                    bound: {
                        left: 10,
                        top: 10,
                        width: 40,
                        height: 20
                    },
                    formattedValue: '10',
                    labelHeight: 20
                }),
                expected = {
                    left: 55,
                    top: 11
                };
            expect(actual).toEqual(expected);
        });

        it('value가 음수일 경우의 series label 렌더링 포지션을 구합니다.', function() {
            var actual = series.makeSeriesRenderingPosition({
                    value: -10,
                    bound: {
                        left: 50,
                        top: 10,
                        width: 40,
                        height: 20
                    },
                    formattedValue: '-10',
                    labelHeight: 20
                }),
                expected = {
                    left: 5,
                    top: 11
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('makeSumLabelHtml', function() {
        it('합계 label html을 생성합니다.', function() {
            var actual = series.makeSumLabelHtml({
                    values: [10, 20, 30],
                    bound: {
                        left: 10,
                        top: 10,
                        width: 40,
                        height: 20
                    },
                    formatFunctions: [],
                    labelHeight: 20
                }),
                expected = '<div class="tui-chart-series-label" style="left:55px;top:11px;font-family:Verdana;font-size:11px" data-group-index="-1" data-index="-1">60</div>';
            expect(actual).toBe(expected);
        });
    });
});
