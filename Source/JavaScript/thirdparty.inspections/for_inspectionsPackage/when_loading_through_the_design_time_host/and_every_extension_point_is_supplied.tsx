// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { SceneEditKind } from '@cratis/scene.model';
import { DesignTimeHost, resolveDesignTimeHost } from '@cratis/scene.react';
import { inspectionsDesignTimePackage } from '../../designTime';
import { generateChecklistItemsActionId, inspectionChecklistDescriptor } from '../../inspectionsDescriptors';
import { aChecklist, aDesignTimeContext, designTimeConfiguration } from '../given/a_design_time_host';

describe('when loading through the design-time host and every extension point is supplied', () => {
    const bundles = [inspectionsDesignTimePackage];
    let host: DesignTimeHost;
    const property = (path: string) => inspectionChecklistDescriptor.properties.find(candidate => candidate.path === path)!;

    beforeEach(() => (host = resolveDesignTimeHost(designTimeConfiguration(bundles), { hostEditorKinds: ['icon'] })));

    it('should approve the package without diagnostics', () => host.diagnostics.should.be.empty);
    it('should find nothing unknown in its descriptors', () => host.diagnoseDescriptors().should.be.empty);

    it('should resolve every extension point to this package', () => {
        [
            host.preview(inspectionChecklistDescriptor),
            host.designer(inspectionChecklistDescriptor),
            host.propertyEditor(inspectionChecklistDescriptor, property('items')),
            host.propertyDisplay(inspectionChecklistDescriptor),
        ].map(resolution => [resolution.package, resolution.contribution !== undefined]).should.deep.equal(Array(4).fill(['Acme.Inspections', true]));
    });

    it('should leave host-provided editor kinds to the host', () =>
        host.propertyEditor(inspectionChecklistDescriptor, property('icon')).should.deep.equal({ hostKind: 'icon' }));

    it('should use the generic editor for properties that ask for nothing', () =>
        host.propertyEditor(inspectionChecklistDescriptor, property('title')).should.deep.equal({}));

    it('should render the preview from the generic context', () => {
        const Preview = host.preview(inspectionChecklistDescriptor).contribution!;
        render(<Preview context={aDesignTimeContext(aChecklist(), bundles).context} />);
        screen.getByLabelText('Checklist preview').textContent!.should.contain('Sample item');
    });

    it('should let the designer submit canonical edits and actions', () => {
        const { context, submittedEdits, submittedActions } = aDesignTimeContext(aChecklist(), bundles);
        const Designer = host.designer(inspectionChecklistDescriptor).contribution!;
        render(<Designer context={context} />);
        fireEvent.click(screen.getByText('Use default title'));
        fireEvent.click(screen.getByText('Generate fields'));
        submittedEdits.should.deep.equal([[{ kind: SceneEditKind.SetProperty, nodeId: 'checklist', path: 'title', value: 'Site inspection' }]]);
        submittedActions.map(action => action.actionId).should.deep.equal([generateChecklistItemsActionId]);
    });

    it('should let the property editor write the collection as one canonical edit', () => {
        const items = [{ id: 'a', property: 'siteId', label: 'Site', required: true }];
        const { context, submittedEdits } = aDesignTimeContext(aChecklist({ items }), bundles);
        const Editor = host.propertyEditor(inspectionChecklistDescriptor, property('items')).contribution!;
        render(<Editor context={context} property={property('items')} value={items} setValue={() => undefined} />);
        fireEvent.change(screen.getByLabelText('Items 1'), { target: { value: 'Site visited' } });
        submittedEdits.should.deep.equal([[{ kind: SceneEditKind.SetProperty, nodeId: 'checklist', path: 'items', value: [{ ...items[0], label: 'Site visited' }] }]]);
    });

    it('should display a property through the package renderer', () => {
        const Display = host.propertyDisplay(inspectionChecklistDescriptor).contribution!;
        render(<Display context={aDesignTimeContext(aChecklist(), bundles).context} property={property('severity')} value='high' />);
        screen.getByRole('status').textContent!.should.equal('High');
    });

    it('should let the package decide that Generate fields is visible and enabled', () =>
        host.actions(inspectionChecklistDescriptor, aDesignTimeContext(aChecklist({ command: 'RecordInspection' }), bundles).context)
            .map(action => [action.descriptor.label, action.visible, action.enabled]).should.deep.equal([['Generate fields', true, true]]));

    it('should run Generate fields as one batch through the host', () => {
        const { context, submittedActions } = aDesignTimeContext(aChecklist({ command: 'RecordInspection' }), bundles);
        const outcome = host.runAction(inspectionChecklistDescriptor, generateChecklistItemsActionId, context);
        outcome.submitted.should.equal(true);
        submittedActions.should.deep.equal([{ actionId: generateChecklistItemsActionId, edits: outcome.edits }]);
        (outcome.edits[0] as { value: { label: string }[] }).value.map(item => item.label).should.deep.equal(['Site Id', 'Fire exits are clear']);
    });

    it('should keep Generate fields disabled until a command is bound', () => {
        const { context, submittedActions } = aDesignTimeContext(aChecklist(), bundles);
        host.actions(inspectionChecklistDescriptor, context)[0].enabled.should.equal(false);
        host.runAction(inspectionChecklistDescriptor, generateChecklistItemsActionId, context).submitted.should.equal(false);
        submittedActions.should.deep.equal([]);
    });
});
