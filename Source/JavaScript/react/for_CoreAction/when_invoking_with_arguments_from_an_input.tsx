// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ExternalComponent } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { RegisteredComponentProps, useValueOutput } from '../renderer';
import { SceneElementView } from '../SceneElementView';

/** The reference input shape from Studio's harness: local state, published as the `value` output. */
function TextInput({ element, bindingOutputs }: RegisteredComponentProps) {
    const [value, setValue] = useState(typeof element.properties.value === 'string' ? element.properties.value : '');
    useValueOutput(bindingOutputs, value);
    return <input aria-label={String(element.properties.ariaLabel)} value={value} onChange={event => setValue(event.target.value)} />;
}

const element = (id: string, componentName: string, properties: Record<string, unknown>) =>
    ({ id, componentName, properties, slots: {} }) as unknown as ExternalComponent;

describe('when invoking a command action with arguments from an input', () => {
    let received: { command: string; arguments: Record<string, unknown> }[];
    const listener = (event: Event) => received.push((event as CustomEvent).detail);

    beforeEach(() => {
        received = [];
        globalThis.addEventListener('cratis.scene.command', listener);
        render(<SceneElementView registry={{ ...coreComponents, 'test:input': TextInput }} dataContext={{ project: { id: 'p-1' } }}
            element={{ id: 'screen', children: [
                element('project.name', 'test:input', { ariaLabel: 'Name', value: 'Draft' }),
                element('rename', 'core:action', {
                    label: 'Rename', command: 'RenameProject',
                    arguments: [{ id: 'a', name: 'projectId', source: 'project.id' }, { id: 'b', name: 'name', source: 'component.project.name.value' }],
                }),
            ] } as never} />);
    });

    afterEach(() => {
        globalThis.removeEventListener('cratis.scene.command', listener);
        cleanup();
    });

    it('should submit the initial value published on mount', () => {
        fireEvent.click(screen.getByText('Rename'));
        received.map(detail => [detail.command, detail.arguments]).should.deep.equal([['RenameProject', { projectId: 'p-1', name: 'Draft' }]]);
    });

    it('should submit what the user typed', () => {
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Atlas' } });
        fireEvent.click(screen.getByText('Rename'));
        received[0].arguments.should.deep.equal({ projectId: 'p-1', name: 'Atlas' });
    });
});
