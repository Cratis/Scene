// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind, ExternalComponent, PackageKind } from '@cratis/scene.model';
import { DesignTimeActionContext, ScenePackageBundle, resolveDesignTimeHost } from '@cratis/scene.react';
import { cratisComponentsPackage } from '../cratisComponentsPackage';

const actionId = 'Cratis.Components.commandForm.generateFields';

/** The packages Cratis.Components depends on, as manifests only - this workspace does not depend on them. */
const dependency = (name: string, version: string): ScenePackageBundle => ({
    manifest: { name, version, kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] },
    components: {},
});

const host = resolveDesignTimeHost({
    bundles: [dependency('PrimeReact', '11.1.0'), dependency('Tailwind', '4.3.3'), cratisComponentsPackage],
    profile: { name: 'studio', targetPlatform: 'web', packages: ['Cratis.Components'] },
    policy: { allowExecutableImports: true, allowNetworkAssets: false, loadDesignTime: true },
});
const form = cratisComponentsPackage.descriptors!.find(descriptor => descriptor.component === 'Cratis.Components:commandForm')!;
const metadata = { properties: [{ name: 'projectId', type: 'Guid' }, { name: 'projectName', type: 'String' }] };

function contextFor(properties: Record<string, unknown>, commandMetadata: DesignTimeActionContext['commandMetadata'] | null = metadata) {
    const submitted: unknown[] = [];
    const element = { id: 'form', componentName: 'Cratis.Components:commandForm', properties, slots: {} } as unknown as ExternalComponent;
    const context = { element, root: element, descriptor: form, commandMetadata: commandMetadata ?? undefined, submitEdits: () => undefined, submitAction: (_: string, edits: unknown) => submitted.push(edits) } as unknown as DesignTimeActionContext;
    return { context, submitted };
}

const stateOf = (properties: Record<string, unknown>, commandMetadata: DesignTimeActionContext['commandMetadata'] | null = metadata) => {
    const [action] = host.actions(form, contextFor(properties, commandMetadata).context).filter(candidate => candidate.descriptor.id === actionId);
    return [action.visible, action.enabled];
};

describe('when Generate fields is offered through the design-time host', () => {
    it('should load the first-party action without diagnostics', () => host.diagnostics.should.deep.equal([]));
    it('should be enabled for a form with command metadata and no fields', () => stateOf({ command: 'StartProject' }).should.deep.equal([true, true]));
    it('should be disabled until command metadata is known', () => stateOf({ command: 'StartProject' }, null).should.deep.equal([true, false]));
    it('should be disabled for authored fields', () => stateOf({ inputs: [{ property: 'projectId', type: 'guid' }] }).should.deep.equal([true, false]));
    it('should be disabled for fields supplied by a binding', () =>
        stateOf({ inputs: { kind: BindingSourceKind.ComponentProperty, componentId: 'table', path: 'selectedItem' } }).should.deep.equal([true, false]));

    it('should submit one batch of generated fields', () => {
        const { context, submitted } = contextFor({ command: 'StartProject' });
        host.runAction(form, actionId, context).submitted.should.equal(true);
        (submitted[0] as { value: { label: string }[] }[])[0].value.map(field => field.label).should.deep.equal(['Project Id', 'Project Name']);
    });

    it('should submit nothing over fields supplied by a binding', () => {
        const { context, submitted } = contextFor({ inputs: { kind: BindingSourceKind.ComponentProperty, componentId: 'table', path: 'selectedItem' } });
        host.runAction(form, actionId, context).submitted.should.equal(false);
        submitted.should.deep.equal([]);
    });
});
