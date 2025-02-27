/**
 * @fileoverview Test dataConverter.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var maker = require('../../src/js/helpers/boundsMaker'),
    chartConst = require('../../src/js/const'),
    defaultTheme = require('../../src/js/themes/defaultTheme'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('boundsMaker', function() {
    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
        maker.chartLeftPadding = chartConst.CHART_PADDING;
    });

    describe('_getValueAxisMaxLabel()', function() {
        it('단일 차트 value axis의 label 최대값을 반환합니다.', function () {
            var result = maker._getValueAxisMaxLabel({
                values: [
                    [20, 30, 50],
                    [40, 40, 60],
                    [60, 50, 10],
                    [80, 10, 70]
                ],
                joinValues: [
                    [20, 30, 50],
                    [40, 40, 60],
                    [60, 50, 10],
                    [80, 10, 70]
                ]
            });
            expect(result).toBe(90);
        });

        it('Combo 차트 value axis의 label 최대값을 반환합니다.', function () {
            var result = maker._getValueAxisMaxLabel({
                values: {
                    column: [
                        [20, 30, 50],
                        [40, 40, 60]
                    ]
                }
            }, 'column');
            expect(result).toBe(70);
        });
    });

    describe('_getXAxisHeight()', function() {
        it('x축 영역의 높이를 계산하여 반환합니다.', function () {
            var result = maker._getXAxisHeight({
                title: 'title'
            }, ['label1', 'label12'], {
                title: {},
                label: {}
            });
            expect(result).toBe(60);
        });
    });

    describe('_getYAxisWidth()', function() {
        it('y축 영역의 너비를 계산하여 반환합니다.', function() {
            var result = maker._getYAxisWidth({
                    title: 'YAxis title'
                },
                ['label1', 'label12'],
                {
                    title: {},
                    label: {}
                }
            );

            expect(result).toBe(97);
        });
    });

    describe('_getYRAxisWidth()', function() {
        it('y right 축 영역의 너비를 계산하여 반환합니다.', function () {
            var result = maker._getYRAxisWidth({
                convertedData: {
                    values: {
                        line: [
                            [60, 50, 10],
                            [80, 10, 70]
                        ]
                    }
                },
                chartTypes: ['column', 'line'],
                theme: {
                    title: {},
                    label: {}
                },
                options: [
                    {
                        title: 'YAxis title'
                    },
                    {
                        title: 'YRAxis title'
                    }
                ]
            });

            expect(result).toBe(97);
        });
    });

    describe('_makeAxesDimension()', function() {
        it('axis영역이 없는 차트의 경우에는 axis들의 너비, 높이 값을 0으로 설정하여 반환합니다.', function () {
            var result = maker._makeAxesDimension({});
            expect(result).toEqual({
                yAxis: {
                    width: 0
                },
                yrAxis: {
                    width: 0
                },
                xAxis: {
                    height: 0
                }
            });
        });

        it('axis영역이 있는 차트의 경우 xAxis의 높이, yAxis의 너비, yrAxis의 너비 값을 계산하여 반환합니다.', function() {
            var result = maker._makeAxesDimension({
                convertedData: {
                    labels: ['label1', 'label12'],
                    joinValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ]
                },
                optionChartTypes: [],
                isVertical: true,
                hasAxes: true,
                theme: {
                    yAxis: {
                        title: {},
                        label: {}
                    },
                    xAxis: {
                        title: {},
                        label: {}
                    }
                },
                options: {
                    yAxis: {
                        title: 'YAxis title'
                    },
                    xAxis: {
                        title: 'XAxis title'
                    }
                },
                axesLabelInfo: {
                    yAxis: [80],
                    xAxis: ['label1', 'label2']
                }
            });
            expect(result.yAxis.width).toBe(97);
            expect(result.yrAxis.width).toBe(0);
            expect(result.xAxis.height).toBe(60);
        });
    });

    describe('_makeLegendDimension()', function() {
        it('legend 영역의 dimension을 계산하여 반환합니다.', function () {
            var acutal = maker._makeLegendDimension([
                    {
                        label: 'label1'
                    },
                    {
                        label: 'label12'
                    }
                ],
                {});
            expect(acutal.width).toBe(87);
        });
    });

    describe('_makeSeriesDimension()', function() {
        it('series 영역의 너비, 높이를 계산하여 반환합니다.', function () {
            var actual = maker._makeSeriesDimension({
                    chartDimension: {
                        width: 500,
                        height: 400
                    },
                    axesDimension: {
                        yAxis: {
                            width: 50
                        },
                        yrAxis: {
                            width: 0
                        },
                        xAxis: {
                            height: 50
                        }
                    },
                    legendWidth: 50,
                    titleHeight: 50
                }),
                expected = {
                    width: 380,
                    height: 280
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeChartDimension()', function() {
        it('chart option(width, height) 정보를 받아 chart dimension을 생성합니다.', function() {
            var actual = maker._makeChartDimension({
                    width: 300,
                    height: 200
                }),
                expected = {
                    width: 300,
                    height: 200
                };
            expect(actual).toEqual(expected);
        });

        it('chart option이 없는 경우에는 기본값으로 dimension을 생성합니다.', function() {
            var actual = maker._makeChartDimension({}),
                expected = {
                    width: chartConst.CHART_DEFAULT_WIDTH,
                    height: chartConst.CHART_DEFAULT_HEIGHT
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeTitleDimension()', function() {
        it('option정보와 테마 정보를 전달하여 title dimension 정보를 생성합니다.', function() {
            var acutal = maker._makeTitleDimension({}, {}),
                expected = {
                    height: 40
                };
            expect(acutal).toEqual(expected);
        });
    });

    describe('_makePlotDimension', function() {
        it('plot dimension은 전달하는 series dimension에서 hidden width 1을 더한 수치로 생성합니다.', function() {
            var acutal = maker._makePlotDimension({
                    width: 200,
                    height: 100
                }),
                expected = {
                    width: 200 + chartConst.HIDDEN_WIDTH,
                    height: 100 + chartConst.HIDDEN_WIDTH
                };
            expect(acutal).toEqual(expected);
        });
    });

    describe('_getComponentsDimension()', function() {
        it('컴포넌트들의 너비,높이 값을 계산하여 반환합니다.', function () {
            var result = maker._getComponentsDimensions({
                convertedData: {
                    labels: ['label1', 'label12'],
                    joinLegendLabels: [{label: 'label1'}, {lable: 'label2'}, {label: 'label3'}],
                    joinValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ]
                },
                optionChartTypes: [],
                isVertical: true,
                hasAxes: true,
                theme: {
                    yAxis: {
                        title: {},
                        label: {}
                    },
                    xAxis: {
                        title: {},
                        label: {}
                    },
                    legend: {
                        label: {}
                    }
                },
                options: {
                    yAxis: {
                        title: 'YAxis title'
                    },
                    xAxis: {
                        title: 'XAxis title'
                    }
                },
                axesLabelInfo: {
                    yAxis: [80],
                    xAxis: ['label1', 'label2']
                }
            });

            expect(result.chart).toEqual({
                width: 500,
                height: 400
            });

            expect(result.title.height).toBe(40);
            expect(result.series.width).toBe(296);
            expect(result.series.height).toBe(280);

            expect(result.legend.width).toBe(87);

            expect(result.yAxis.width).toBe(97);
            expect(result.yrAxis.width).toBe(0);
            expect(result.xAxis.height).toBe(60);
        });
    });

    describe('_makeBasicBound()', function() {
        it('dimension과 top, left 정보를 전달받아 기본형태의 bound 정보를 생성합니다.', function() {
            var actual = maker._makeBasicBound({
                    width: 100,
                    height: 100
                }, 10, 20),
                expected = {
                    dimension: {
                        width: 100,
                        height: 100
                    },
                    position: {
                        top: 10,
                        left: 20
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeYAxisBound()', function() {
       it('yAxis width, plot height, top 정보를 받아 yAxis bound정보를 생성합니다.', function() {
           var actual = maker._makeYAxisBound({
                   yAxis: {
                       width: 100
                   },
                   plot: {
                       height: 200
                   }
               }, 20),
               expected = {
                   dimension: {
                       width: 100,
                       height: 200
                   },
                   position: {
                       top: 20,
                       left: 10
                   }
               };
           expect(actual).toEqual(expected);
       });
    });

    describe('_makeXAxisBound()', function() {
        it('xAxis height, plot width, series height, top, left 정보를 받아 xAxis bound정보를 생성합니다.', function() {
            var actual = maker._makeXAxisBound({
                    xAxis: {
                        height: 100
                    },
                    plot: {
                        width: 200
                    },
                    series: {
                        height: 100
                    }
                }, 10, 20),
                expected = {
                    dimension: {
                        width: 200,
                        height: 100
                    },
                    position: {
                        top: 110,
                        left: 19
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeYRAxisBound()', function() {
        it('yrAxis width, plot height, legend width, top 정보를 받아 yrAxis bound정보를 생성합니다.', function() {
            var actual = maker._makeYRAxisBound({
                    yrAxis: {
                        width: 100
                    },
                    plot: {
                        height: 200
                    },
                    legend: {
                        width: 50
                    }
                }, 20),
                expected = {
                    dimension: {
                        width: 100,
                        height: 200
                    },
                    position: {
                        top: 20,
                        right: 61
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeAxesBounds()', function() {
        it('axis영역 표현에 필요한 컴포넌트(xAxis, yAxis, plot)들의 bounds 정보를 기본 dimension정보를 기반으로 계산하여 반환합니다.', function () {
            var actual = maker._makeAxesBounds({
                hasAxes: true,
                dimensions: {
                    plot: {width: 300, height: 200},
                    series: {width: 299, height: 199},
                    legend: {width: 70},
                    yAxis: {width: 50},
                    yrAxis: {width: 0},
                    xAxis: {height: 50}
                },
                top: 20,
                left: 20
            });

            expect(actual.plot.position).toEqual({top: 20, left: 19});
            expect(actual.yAxis.dimension.height).toBe(200);
            expect(actual.yAxis.position.top).toBe(20);
            expect(actual.yAxis.position.left).toBe(10);
            expect(actual.xAxis.dimension.width).toBe(300);
            expect(actual.xAxis.position.top).toBe(219);
            expect(actual.xAxis.position.left).toBe(19);
        });

        it('hasAxes값이 없을 경우에는 빈 객체를 반환합니다.', function() {
            var actual = maker._makeAxesBounds({});
            expect(actual).toEqual({});
        });

        it('optionChartTypes값이 있을 경우에는 우측 yAxis옵션 정보를 반환합니다.', function() {
            var actual = maker._makeAxesBounds({
                hasAxes: true,
                optionChartTypes: ['line', 'column'],
                dimensions: {
                    plot: {width: 300, height: 200},
                    series: {width: 299, height: 199},
                    legend: {width: 70},
                    yAxis: {width: 50},
                    yrAxis: {width: 50},
                    xAxis: {height: 50}
                },
                top: 20,
                left: 20
            });
            expect(actual.yrAxis.dimension.height).toBe(200);
            expect(actual.yrAxis.position.top).toBe(20);
            expect(actual.yrAxis.position.right).toBe(81);
        });
    });

    describe('_makeChartBound()', function() {
        it('dimension정보를 받아 chart bound정보를 생성합니다.', function() {
            var actual = maker._makeChartBound({
                    width: 100,
                    height: 100
                }),
                expected = {
                    dimension: {
                        width: 100,
                        height: 100
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeLegendBound()', function() {
        it('title height, yAxis width, series width, yrAxis width 정보를 받아 legend bound정보를 생성합니다.', function() {
            var actual = maker._makeLegendBound({
                    title: {
                        height: 20
                    },
                    yAxis: {
                        width: 30
                    },
                    series: {
                        width: 200
                    },
                    yrAxis: {
                        width: 30
                    }
                }),
                expected = {
                    position: {
                        top: 20,
                        left: 270
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeAxesLabelInfo()', function() {
        it('세로 타입의 차트에서는 yAxis는 value, xAxis는 category가 label이 됩니다.', function() {
            var actual = maker._makeAxesLabelInfo({
                    hasAxes: true,
                    optionChartTypes: ['column'],
                    convertedData: {
                        values: {
                            'column': [10, 20, 30]
                        },
                        labels: ['cate1', 'cate2', 'cate3'],
                        formatFunctions: []
                    },
                    isVertical: true
                }),
                expected = {
                    xAxis: ['cate1', 'cate2', 'cate3'],
                    yAxis: [40]
                };
            expect(actual).toEqual(expected);
        });

        it('가로 타입의 차트에서는 yAxis는 category, xAxis는 value가 label이 됩니다.', function() {
            var actual = maker._makeAxesLabelInfo({
                    hasAxes: true,
                    optionChartTypes: ['column'],
                    convertedData: {
                        values: {
                            'column': [10, 20, 30]
                        },
                        labels: ['cate1', 'cate2', 'cate3'],
                        formatFunctions: []
                    },
                    isVertical: false
                }),
                expected = {
                    xAxis: [40],
                    yAxis: ['cate1', 'cate2', 'cate3']
                };
            expect(actual).toEqual(expected);
        });

        it('hasAxes가 존재하지 않거나 false이면 null을 반환합니다.', function() {
            var actual = maker._makeAxesLabelInfo({
                    hasAxes: false
                });
            expect(actual).toBeNull();
        });
    });

    describe('_findRotationDegree()', function() {
        it('후보 각(25, 45, 65, 85)을 순회하며 회전된 비교 너비가 제한 너비보다 작으면 해당 각을 반환합니다.', function() {
            var actual = maker._findRotationDegree(50, 60, 20),
                expected = 25;
            expect(actual).toBe(expected);
        });

        it('최대 회전각은 85도 입니다.', function() {
            var actual = maker._findRotationDegree(5, 120, 20),
                expected = 85;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeHorizontalLabelRotationInfo', function() {
        it('레이블 중 가장 긴 레이블이 제한 너비를 초과하지 않는 적절한 회전각을 반환합니다.', function() {
            var actual, expected;

            spyOn(renderUtil, 'getRenderedLabelsMaxWidth').and.returnValue(120);
            actual = maker._makeHorizontalLabelRotationInfo(300, ['cate1', 'cate2', 'cate3'], {});
            expected = {
                maxLabelWidth: 120,
                labelHeight: 20,
                degree: 25
            };
            expect(actual).toEqual(expected);
        });

        it('최대 회전각은 85도 입니다.', function() {
            var actual, expected;

            spyOn(renderUtil, 'getRenderedLabelsMaxWidth').and.returnValue(120);
            actual = maker._makeHorizontalLabelRotationInfo(5, ['cate1', 'cate2', 'cate3'], {});
            expected = {
                maxLabelWidth: 120,
                labelHeight: 20,
                degree: 85
            };
            expect(actual).toEqual(expected);
        });

        it('회전하지 않는 상태의 가장 긴 레이블의 길이가 제한 너비를 초과하지 않으면 null을 반환합니다.', function() {
            var actual;

            spyOn(renderUtil, 'getRenderedLabelsMaxWidth').and.returnValue(40);
            actual = maker._makeHorizontalLabelRotationInfo(300, ['cate1', 'cate2'], {});

            expect(actual).toBeNull();
        });
    });

    describe('_calculateOverflowLeft()', function() {
        it('회전된 xAxis label이 왼쪽 차트 시작 영역을 얼마나 넘어갔는지 값을 계산하여 반환합니다.', function() {
            var actual = maker._calculateOverflowLeft(50, {
                    degree: 25,
                    maxLabelWidth: 120,
                    labelHeight: 20
                }, 'abcdefghijklmnopqrstuvwxyz', {}),
                expected = 3.7677545866464826;
            expect(actual).toBe(expected);
        });
    });

    describe('_calculateXAxisHeight()', function() {
        it('레이블 dimension과 degree 정보를 이용하여 x axis의 회전된 높이 정보를 구합니다.', function() {
            var actual = maker._calculateXAxisHeight({
                    degree: 25,
                    maxLabelWidth: 100,
                    labelHeight: 20
                }),
                expected = 60.38798191480294;
            expect(actual).toBe(expected);
        });
    });

    describe('_calculateHeightDifference()', function() {
        it('회전된 레이블과 원래의 레이블의 높이 차이를 계산합니다.', function() {
            var actual = maker._calculateHeightDifference({
                    degree: 25,
                    maxLabelWidth: 100,
                    labelHeight: 20
                }),
                expected = 40.38798191480294;
            expect(actual).toBe(expected);
        });
    });

    describe('_updateDegree()', function() {
        it('overflowLeft값이 0보다 크면 degree를 재계산하여 rotationInfo.degree의 값을 갱신합니다.', function() {
            var rotationInfo = {
                degree: 25,
                maxLabelWidth: 100,
                labelHeight: 20
            };
            maker._updateDegree(200, rotationInfo, 8, 20);
            expect(rotationInfo.degree).toEqual(85);
        });
    });

    describe('_updateDimensionsWidth()', function() {
        it('50의 overflowLeft를 전달하면 chartLeftPadding은 50 증가하고 나머지 dimensions의 width들을 50씩 감소합니다.', function() {
            var dimensions = {
                plot: {
                    width: 200
                },
                series: {
                    width: 199
                },
                xAxis: {
                    width: 200
                }
            };

            maker.chartLeftPadding = 10;
            maker._updateDimensionsWidth(dimensions, 50);

            expect(maker.chartLeftPadding).toBe(60);
            expect(dimensions.plot.width).toBe(150);
            expect(dimensions.series.width).toBe(149);
            expect(dimensions.xAxis.width).toBe(150);
        });
    });

    describe('_updateDimensionsHeight()', function() {
        it('50의 diffHeight를 전달하면 xAxis.heihgt는 50 감소하고, plot.height, series.height는 50 증가합니다.', function() {
            var dimensions = {
                plot: {
                    height: 200
                },
                series: {
                    height: 199
                },
                xAxis: {
                    height: 50
                }
            };

            maker._updateDimensionsHeight(dimensions, 50);

            expect(dimensions.plot.height).toBe(150);
            expect(dimensions.series.height).toBe(149);
            expect(dimensions.xAxis.height).toBe(100);
        });
    });

    describe('make()', function() {
        it('차트를 구성하는 컴포넌트들의 bounds 정보를 계산하여 반환합니다.', function () {
            var result = maker.make({
                convertedData: {
                    values: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ],
                    joinValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ],
                    labels: ['label1', 'label2', 'label3'],
                    joinLegendLabels: [{label: 'label1'}, {lable: 'label2'}, {label: 'label3'}],
                    formatValues: [
                        [20, 30, 50],
                        [40, 40, 60],
                        [60, 50, 10],
                        [80, 10, 70]
                    ]
                },
                theme: defaultTheme,
                hasAxes: true,
                options: {}
            });
            expect(result.chart.dimension.width).toBe(500);
            expect(result.chart.dimension.height).toBe(400);
            expect(result.series.dimension.width).toBe(296);
            expect(result.series.dimension.height).toBe(280);
            expect(result.series.position.top).toBe(50);
            expect(result.series.position.left).toBe(107);
            expect(result.yAxis.dimension.width).toBe(97);
            expect(result.yAxis.dimension.height).toBe(281);
            expect(result.yAxis.position.top).toBe(50);
            expect(result.xAxis.dimension.width).toBe(297);
            expect(result.xAxis.dimension.height).toBe(60);
            expect(result.xAxis.position.top).toBe(330);
            expect(result.legend.position.top).toBe(40);
            expect(result.legend.position.left).toBe(403);
            expect(result.tooltip.position.top).toBe(50);
            expect(result.tooltip.position.left).toBe(97);
        });
    });
});
