// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ChartKind, dataMaximum, donutSlices, funnelStages, niceScale, readSeries, ringPath } from '../foundation';

describe('when scaling and slicing chart data', () => {
    it('should round the axis maximum up to a readable step', () => {
        const scale = niceScale(234);
        scale.maximum.should.equal(300);
        scale.ticks.should.deep.equal([0, 100, 200, 300]);
        niceScale(240, 8).ticks.should.deep.equal([0, 50, 100, 150, 200, 250]);
    });

    it('should scale a unit range and an empty one', () => {
        niceScale(1).ticks.should.deep.equal([0, 0.5, 1]);
        niceScale(0).ticks.should.deep.equal([0, 1]);
        niceScale(Number.NaN).maximum.should.equal(1);
    });

    it('should add stacked series up and compare the others one by one', () => {
        const series = [{ name: 'a', values: [1, 5] }, { name: 'b', values: [4, 2] }];
        dataMaximum(ChartKind.Stacked, series, 2).should.equal(7);
        dataMaximum(ChartKind.Bar, series, 2).should.equal(5);
    });

    it('should read only well-formed series and treat a bad value as zero', () => {
        readSeries([{ name: 'a', values: [1, 'x', Number.NaN, 3] }, { name: 7, values: [1] }, 'nope', { name: 'b' }]).should.deep.equal([{ name: 'a', values: [1, 0, 0, 3] }]);
        readSeries(undefined).should.deep.equal([]);
    });

    it('should divide a donut into shares that make one turn and skip empty and negative values', () => {
        const slices = donutSlices([25, 0, 75, -5]);
        slices.map(slice => slice.share).should.deep.equal([0.25, 0.75]);
        slices[1].end.should.be.closeTo(Math.PI * 2, 1e-9);
        donutSlices([0, 0]).should.deep.equal([]);
    });

    it('should draw a full turn as two arcs and a segment as one', () => {
        (ringPath(50, 50, 40, 20, 0, Math.PI * 2).match(/A /g) ?? []).length.should.equal(4);
        (ringPath(50, 50, 40, 20, 0, 1).match(/A /g) ?? []).length.should.equal(2);
    });

    it('should size funnel stages against the widest', () => {
        funnelStages([200, 100, 50]).map(stage => stage.widthRatio).should.deep.equal([1, 0.5, 0.25]);
        funnelStages([0, 0]).map(stage => stage.widthRatio).should.deep.equal([0, 0]);
    });
});
