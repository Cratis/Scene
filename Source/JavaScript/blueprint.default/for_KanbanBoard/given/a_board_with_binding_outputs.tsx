// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import sinon from 'sinon';
import { KanbanBoard, foundationElement } from '../../foundation';

export const columns = [{ id: 'todo', label: 'To do' }, { id: 'done', label: 'Done' }];
export const cards = [{ id: 'one', title: 'First task', column: 'todo', ownerId: 'alice' }, { id: 'two', title: 'Second task', column: 'done', ownerId: 'bob' }];

export function aBoardWithBindingOutputs(properties: Record<string, unknown> = {}) {
    const published: Record<string, unknown> = {};
    const setOutput = sinon.spy((name: string, value: unknown) => { published[name] = value; });
    const bindingOutputs = { setOutput, clearOutput: () => undefined, clearAll: () => undefined };
    const onChange = sinon.spy();
    const onSelect = sinon.spy();
    const draw = (overrides: Record<string, unknown> = {}) => <KanbanBoard element={foundationElement('kanbanBoard', { columns, cards, selectionMode: 'single', ...properties, ...overrides })} slots={{}} bindingOutputs={bindingOutputs} interactions={{ onChange, onSelect }} />;
    const rendered = render(draw());
    return { ...rendered, published, setOutput, onChange, onSelect, update: (overrides: Record<string, unknown>) => rendered.rerender(draw(overrides)) };
}
