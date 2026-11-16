// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cratisComponentsPackage } from '@cratis/scene.components';
import type { DesignTimeActionContext } from '@cratis/scene.react';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { authoredRoot, createScreenDocument, editingScope } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { applyAllToSession, openSession } from '../../Session/EditSession';
import { projectToLegacyElements } from '../projectToLegacyElements';

const slice = 'ce3601ed-3fd0-4569-ab8c-dfbeccff7974';
const elementId = 'ef94e6d8-2312-4aeb-96c4-04c4e95d233a';

// What a host posts for a form is the canonical document and this projection side by side. Posting is the host's, so
// the host's own specifications check the wire; this one checks what the editor hands it.
describe('when projecting a placed command form after the published Generate fields action', () => {
    let inputs: unknown[];
    let document: ReturnType<typeof createScreenDocument>;

    beforeAll(() => {
        const bundles = [cratisComponentsPackage];
        const profile = { name: 'Studio', targetPlatform: 'web', packages: ['Cratis.Components'] };
        const runtime = createScreenEditorRuntime(bundles, profile);
        const element = createExternalComponent(elementId, 'Register product', 'Cratis.Components:commandForm', { command: slice });
        const root = createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [element]);
        const action = cratisComponentsPackage.designTime!.actions!['Cratis.Components.commandForm.generateFields'];
        const context: DesignTimeActionContext = {
            element, root, descriptor: runtime.catalog.components.find(descriptor => descriptor.component === element.componentName)!, profile, bundles,
            permissions: {}, capabilities: {}, diagnostics: [], submitEdits: () => undefined, submitAction: () => undefined,
            commandMetadata: { properties: [{ name: 'productId', type: 'Guid', label: 'Product ID' }, { name: 'name', type: 'string' }] },
        };
        action.isEnabled(context).should.be.true;
        const generated = action.execute(context);
        generated.diagnostics.should.deep.equal([]);
        const session = applyAllToSession(openSession(createScreenDocument(root)), generated.edits, { catalog: runtime.catalog, scope: editingScope() }, 'Generate fields');
        session.diagnostics.should.deep.equal([]);
        session.isDirty.should.be.true;
        document = session.document;
        const legacyElements = projectToLegacyElements(authoredRoot(session.document), runtime.legacyTypeOf);
        inputs = (legacyElements[0] as { properties: { inputs: unknown[] } }).properties.inputs;
    });

    it('should project both fields produced by the installed package', () => inputs.should.have.lengthOf(2));
    it('should project the generated inputs as plain data a host can post unchanged', () => JSON.parse(JSON.stringify(inputs)).should.deep.equal(inputs));
    it('should keep the canonical document alongside the projection', () => JSON.parse(JSON.stringify(document)).screens.should.have.lengthOf(1));
});
