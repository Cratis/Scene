// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { SceneEdit, SceneEditKind } from '@cratis/scene.model';
import { DesignTimeContext } from '@cratis/scene.react';
import { CommandFormLayoutEditor } from '../CommandFormLayoutEditor';

describe('when arranging command form fields with the keyboard', () => {
    const layout = { columns: [{ index: 1 }, { index: 2 }], placements: [{ field: 'name', row: 1, column: 1 }] };
    let edits: SceneEdit[][];
    let values: unknown[];

    beforeEach(() => {
        edits = [];
        values = [];
        const context = { element: { id: 'form' }, submitEdits: (batch: SceneEdit[]) => edits.push(batch) } as unknown as DesignTimeContext;
        render(<CommandFormLayoutEditor context={context} value={layout} setValue={value => values.push(value)}
            property={{ path: 'layout', label: 'Layout', group: 'Layout', valueType: 'object' as never }} />);
    });

    it('should move a field with an arrow key as one canonical edit', () => {
        fireEvent.keyDown(screen.getByRole('button', { name: /^name:/ }), { key: 'ArrowRight' });
        edits.should.deep.equal([[{ kind: SceneEditKind.SetProperty, nodeId: 'form', path: 'layout', value: { ...layout, placements: [{ field: 'name', row: 1, column: 2 }] } }]]);
        values.length.should.equal(1);
    });

    it('should resize a field with shift and an arrow key', () => {
        fireEvent.keyDown(screen.getByRole('button', { name: /^name:/ }), { key: 'ArrowRight', shiftKey: true });
        (edits[0][0] as { value: typeof layout }).value.placements.should.deep.equal([{ field: 'name', row: 1, column: 1, columnSpan: 2 }]);
    });

    it('should ignore keys that do not arrange fields', () => {
        fireEvent.keyDown(screen.getByRole('button', { name: /^name:/ }), { key: 'Enter' });
        edits.should.deep.equal([]);
    });

    it('should describe each field\'s position for assistive technology', () =>
        Boolean(screen.getByRole('button', { name: 'name: row 1, column 1, spans 1 column(s) and 1 row(s)' })).should.equal(true));
});

describe('when moving a command form field past the last column with the keyboard', () => {
    it('should announce the problem and submit nothing', () => {
        const edits: SceneEdit[][] = [];
        const context = { element: { id: 'form' }, submitEdits: (batch: SceneEdit[]) => edits.push(batch) } as unknown as DesignTimeContext;
        render(<CommandFormLayoutEditor context={context} setValue={() => undefined}
            value={{ columns: [{ index: 1 }, { index: 2 }], placements: [{ field: 'name', row: 1, column: 2 }] }}
            property={{ path: 'layout', label: 'Layout', group: 'Layout', valueType: 'object' as never }} />);

        fireEvent.keyDown(screen.getByRole('button', { name: /^name:/ }), { key: 'ArrowRight' });
        edits.should.deep.equal([]);
        screen.getByRole('alert').textContent!.should.equal("Placement for 'name' extends beyond the declared columns.");
    });
});
