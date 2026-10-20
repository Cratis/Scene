// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { afterEach } from 'vitest';
import { FlowContainerKind, type FlowGrid, type FlowNode, type FlowRow, type FlowSlotLeaf } from '@cratis/scene.model';
import { FlowArrangementView } from '../FlowArrangementView';

const leaf = (slotName: string, extra: Partial<FlowNode> = {}): FlowSlotLeaf => ({ slotName, ...extra });
const slots = { nav: 'Nav', content: 'Content' };
const children = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.flow-child'));

describe('when arranging children', () => {
    afterEach(cleanup);

    describe('in a grid', () => {
        let spanning: HTMLElement;
        let plain: HTMLElement;

        beforeEach(() => {
            const grid: FlowGrid = { kind: FlowContainerKind.Grid, gap: 0, columns: 4, children: [leaf('nav', { grow: 1 }), leaf('content', { span: 3 })] };
            const { container } = render(<FlowArrangementView node={grid} slots={slots} />);
            [plain, spanning] = children(container);
        });

        it('should span the columns the child asks for', () => spanning.style.gridColumn.should.equal('span 3'));
        it('should place a child without a span with no grid column', () => plain.style.gridColumn.should.equal(''));
        it('should not apply flex sizing', () => (plain.style.flex === '' && spanning.style.flex === '').should.equal(true));
    });

    describe('in a row', () => {
        let growing: HTMLElement;
        let fixed: HTMLElement;

        beforeEach(() => {
            const row: FlowRow = { kind: FlowContainerKind.Row, gap: 0, children: [leaf('nav'), leaf('content', { grow: 2, span: 3 })] };
            const { container } = render(<FlowArrangementView node={row} slots={slots} />);
            [fixed, growing] = children(container);
        });

        it('should grow a growing child', () => growing.style.flex.should.equal('2 1 0%'));
        it('should keep a non growing child at its content size', () => fixed.style.flex.should.equal('0 0 auto'));
        it('should ignore span', () => growing.style.gridColumn.should.equal(''));
    });
});
