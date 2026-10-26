// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { BindingSourceKind, ExternalComponent, FormPropertyNames, HorizontalAlignment, InteractionAction, InteractionActionKind, SetStateAction, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { commandResponseContext, runActions } from '@cratis/scene.engine';
import { RecordingDispatcher } from '../../engine/for_runActions/given/a_recording_dispatcher';
import { InteractiveComponent } from '../renderer/InteractiveComponent';
import { RegisteredComponentProps } from '../renderer';
import { RenderBindingScopeProvider } from '../renderer/RenderBindingScopeContext';

const response = { kind: BindingSourceKind.CommandResponse, path: 'id' };
const ordinary = { kind: BindingSourceKind.DataContext, path: 'label' };
const actions: SetStateAction[] = [{ kind: InteractionActionKind.SetState, target: 'created', value: response }, { kind: InteractionActionKind.SetState, target: 'label', value: ordinary }];
const element: ExternalComponent = {
    id: 'form', name: 'Form', componentName: 'test:form', slots: {},
    properties: { [FormPropertyNames.onSubmit]: actions, label: ordinary, nested: { label: ordinary }, labels: [ordinary] },
    size: {}, minimumSize: {}, maximumSize: {}, margin: { left: 0, top: 0, right: 0, bottom: 0 },
    visibility: Visibility.Visible, isEnabled: true, opacity: 1, zIndex: 0,
    horizontalAlignment: HorizontalAlignment.Stretch, verticalAlignment: VerticalAlignment.Stretch,
};

describe('when preserving form submit declarations', () => {
    const received: ExternalComponent[] = [];
    function Capture({ element: rendered }: RegisteredComponentProps) {
        received.push(rendered);
        return <span>{String(rendered.properties.label)}</span>;
    }
    beforeEach(() => { received.length = 0; });
    afterEach(cleanup);

    function renderForm() {
        render(<RenderBindingScopeProvider dataContext={{ label: 'render-time' }}>
            <InteractiveComponent element={element} component={Capture} slots={{}} />
        </RenderBindingScopeProvider>);
    }

    it('should preserve onSubmit identity while resolving every ordinary visual property', () => {
        renderForm();
        expect(received[0].properties[FormPropertyNames.onSubmit]).toBe(actions);
        expect(screen.getByText('render-time')).toBeDefined();
        expect(received[0].properties.nested).toEqual({ label: 'render-time' });
        expect(received[0].properties.labels).toEqual(['render-time']);
        actions[0].should.deep.equal({ kind: InteractionActionKind.SetState, target: 'created', value: response });
    });

    it('should evaluate non-response bindings inside the continuation at execution, not render', async () => {
        renderForm();
        const dispatcher = new RecordingDispatcher();
        let label = 'before-execution';
        const context = commandResponseContext({ resolve: () => label }, 'Create', undefined);
        label = 'execution-time';
        const continuation = received[0].properties[FormPropertyNames.onSubmit] as InteractionAction[];
        await runActions(continuation.slice(1), dispatcher, context);
        dispatcher.calls.should.deep.equal(['setState:label:execution-time']);
    });
});
