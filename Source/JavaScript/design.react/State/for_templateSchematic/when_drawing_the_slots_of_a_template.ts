// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenTemplate } from '@cratis/scene.model';
import { outletNamesOfTemplate, templateSchematic } from '../templateSchematic';

const slots = (...names: string[]) => names.map(name => ({ name }));
const template = (names: string[], arrangement?: unknown): Pick<ScreenTemplate, 'slots' | 'arrangement'> =>
    ({ slots: slots(...names), ...(arrangement === undefined ? {} : { arrangement: arrangement as never }) });
const byName = (boxes: ReturnType<typeof templateSchematic>, name: string) => boxes.find(box => box.slot.name === name)!;

describe('when drawing the slots of a template', () => {
    describe('and it has no slots', () => {
        it('should draw nothing', () => templateSchematic(template([])).should.be.empty);
    });

    describe('and it has no arrangement', () => {
        const boxes = templateSchematic(template(['header', 'body', 'actions']));

        it('should stack every slot in declaration order', () => boxes.map(box => box.y).should.deep.equal([0, 100 / 3, 200 / 3]));
        it('should give each the full width', () => boxes.every(box => box.width === 100).should.equal(true));
    });

    describe('and a flow arrangement lays a row beside a column', () => {
        const boxes = templateSchematic(template(['nav', 'main', 'footer'], {
            root: { kind: 'Column', gap: 0, children: [
                { kind: 'Row', gap: 0, grow: 3, children: [{ slotName: 'nav', grow: 1 }, { slotName: 'main', grow: 3 }] },
                { slotName: 'footer', grow: 1 },
            ] },
        }));

        it('should put the nav at the left of the row', () => byName(boxes, 'nav').should.include({ x: 0, y: 0, width: 25, height: 75 }));
        it('should give the main slot the room that is left', () => byName(boxes, 'main').should.include({ x: 25, width: 75 }));
        it('should put the footer under the row', () => byName(boxes, 'footer').should.include({ x: 0, y: 75, width: 100, height: 25 }));
    });

    describe('and a flow arrangement lays out a grid', () => {
        const boxes = templateSchematic(template(['a', 'b', 'c', 'd'], { root: { kind: 'Grid', gap: 0, columns: 2, children: ['a', 'b', 'c', 'd'].map(slotName => ({ slotName })) } }));

        it('should put the third slot under the first', () => byName(boxes, 'c').should.include({ x: 0, y: 50, width: 50, height: 50 }));
    });

    describe('and a freeform arrangement places the slots', () => {
        const boxes = templateSchematic(template(['side', 'content'], { variants: [{ sizeClass: {}, placements: [
            { slotName: 'side', x: 0, y: 0, width: 200, height: 800 }, { slotName: 'content', x: 200, y: 0, width: 600, height: 800 },
        ] }] }));

        it('should scale the placements to the frame they span', () => byName(boxes, 'content').should.include({ x: 25, y: 0, width: 75, height: 100 }));
    });

    describe('and the arrangement forgets a slot', () => {
        const boxes = templateSchematic(template(['body', 'forgotten'], { root: { kind: 'Column', gap: 0, children: [{ slotName: 'body' }] } }));

        it('should still show the slot', () => boxes.map(box => box.slot.name).should.deep.equal(['body', 'forgotten']));
        it('should put it in a strip under what was laid out', () => byName(boxes, 'forgotten').y.should.be.greaterThan(byName(boxes, 'body').y + byName(boxes, 'body').height - 1));
    });
});

describe('when listing the outlets a template offers', () => {
    it('should name each outlet', () => outletNamesOfTemplate({ outlets: [{ name: 'toolbar' }, { name: 'filters' }, { nameless: true }] }).should.deep.equal(['toolbar', 'filters']));
    it('should list none for a template without outlets', () => outletNamesOfTemplate({}).should.be.empty);
});
