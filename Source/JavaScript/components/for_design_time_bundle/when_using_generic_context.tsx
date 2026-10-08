// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { DesignTimeContext } from '@cratis/scene.react';
import { PropertyValueType, SceneEdit, SceneEditKind } from '@cratis/scene.model';
import { cratisComponentsPackage } from '../cratisComponentsPackage';

describe('when using generic context', () => {
    const submitted: SceneEdit[][] = [];
    const actions: string[] = [];
    const context = {
        element: { id: 'form', componentName: 'Cratis.Components:commandForm', properties: {}, slots: {} },
        root: { id: 'form', componentName: 'Cratis.Components:commandForm', properties: {}, slots: {} },
        descriptor: cratisComponentsPackage.descriptors!.find(descriptor => descriptor.component === 'Cratis.Components:commandForm')!,
        profile: { name: 'web', targetPlatform: 'web', packages: ['Cratis.Components'] },
        bundles: [cratisComponentsPackage],
        permissions: { edit: true },
        capabilities: { 'commandForm.generateFields': true },
        diagnostics: [],
        submitEdits: (edits: SceneEdit[]) => submitted.push(edits),
        submitAction: (action: string) => actions.push(action),
    } as unknown as DesignTimeContext;

    it('should let a package designer submit a canonical action through the shared boundary', () => {
        const Designer = cratisComponentsPackage.designTime!.designers!.commandFormDesigner;
        render(<Designer context={context} />);
        fireEvent.click(screen.getByText('Generate fields'));
        actions.should.deep.equal(['Cratis.Components.commandForm.generateFields']);
    });

    it('should let a package property editor submit canonical scene edits', () => {
        const Editor = cratisComponentsPackage.designTime!.propertyEditors!.commandBinding;
        render(<Editor context={context} property={{ path: 'command', label: 'Command', group: 'Command', valueType: PropertyValueType.String }} value='' setValue={() => undefined} />);
        fireEvent.change(screen.getByLabelText('Command'), { target: { value: 'RecordInvoice' } });
        submitted.at(-1)!.should.deep.equal([{ kind: SceneEditKind.SetProperty, nodeId: 'form', path: 'command', value: 'RecordInvoice' }]);
    });
});
