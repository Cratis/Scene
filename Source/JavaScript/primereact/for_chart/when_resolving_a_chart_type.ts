// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { sceneComponent } from '../storyElements';
import { ChartType } from '../chart/ChartType';
import { legacyChartTypes, resolveChartType } from '../chart/resolveChartType';

/**
 * The members of `PrimeReact.Charts.ChartType` in declaration order, copied from
 * `Studio/Source/PrimeReact/Charts/Chart.cs`. The position of each is the ordinal a migrated document stores.
 */
const legacyEnumMembers = ['Bar', 'Line', 'Pie', 'Doughnut', 'PolarArea', 'Radar', 'Bubble', 'Scatter'];

function resolve(type?: unknown) {
    return resolveChartType(sceneComponent('chart', 'chart', type === undefined ? {} : { type }));
}

function typeOf(resolution: ReturnType<typeof resolve>): string {
    return resolution.isValid ? resolution.type : `invalid:${resolution.message}`;
}

describe('when resolving a chart type', () => {
    it('should declare exactly the legacy enum members, in order', () => {
        legacyChartTypes.map(type => Object.keys(ChartType).find(name => ChartType[name as keyof typeof ChartType] === type))
            .should.deep.equal(legacyEnumMembers);
    });

    for (const [ordinal, member] of legacyEnumMembers.entries()) {
        describe(`and the type is the legacy ordinal ${ordinal}`, () => {
            it('should resolve to the chart type the original enum member names', () => {
                typeOf(resolve(ordinal)).should.equal(ChartType[member as keyof typeof ChartType]);
            });

            it('should resolve its Pascal case member name to the same type', () => {
                typeOf(resolve(member)).should.equal(typeOf(resolve(ordinal)));
            });

            it('should resolve its canonical name to the same type', () => {
                typeOf(resolve(ChartType[member as keyof typeof ChartType])).should.equal(typeOf(resolve(ordinal)));
            });
        });
    }

    it('should default an absent type to a bar chart, as the original control did', () => {
        typeOf(resolve()).should.equal('bar');
    });

    it('should not rewrite the stored type', () => {
        const element = sceneComponent('chart', 'chart', { type: 4 });
        resolveChartType(element);
        (element.properties.type === 4).should.be.true;
    });

    const unsupported: [string, unknown][] = [
        ['an ordinal past the last member', 8],
        ['a negative ordinal', -1],
        ['a fractional ordinal', 1.5],
        ['a numeric string', '3'],
        ['a lower case member name', 'polararea'],
        ['a canonical name with stray whitespace', 'polarArea '],
        ['null', null],
        ['a boolean', true],
        ['an object', { type: 'bar' }],
        ['an infinite number', Number.POSITIVE_INFINITY],
    ];

    for (const [description, value] of unsupported) {
        describe(`and the type is ${description}`, () => {
            it('should be a finding rather than a different chart', () => {
                resolve(value).isValid.should.be.false;
            });

            it('should say what was authored and what is accepted', () => {
                const resolution = resolve(value);
                const message = resolution.isValid ? '' : resolution.message;
                message.should.contain('Unsupported chart type').and.contain('polarArea');
            });
        });
    }
});
