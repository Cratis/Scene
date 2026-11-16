// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type PropertyDescriptor, type SceneDocument } from '@cratis/scene.model';
import { authoredRoot } from '../Document/studioScreen';
import { createExternalComponent } from '../Document/createExternalComponent';
import { createPanel } from '../Document/createPanel';
import { LayoutItem } from '../Layouts/LayoutItem';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import type { SceneScreenDraftRequest } from './SceneScreenDraft';

const scalarTypes = [PropertyValueType.String, PropertyValueType.Number, PropertyValueType.Boolean];
const standaloneControls = new Set(['core:text', 'core:title', 'core:button', 'PrimeReact:inputText', 'PrimeReact:inputTextarea', 'PrimeReact:checkbox']);

export const supportedDraftProperty = (property: PropertyDescriptor): boolean =>
    !property.readOnly && !property.output && !/(html|script|behavior|action|command|destination|template|query|binding|argument|result|source|slot)/i.test(property.path) &&
    !/(query|binding|command|action)/i.test(property.editorKind ?? '') &&
    scalarTypes.includes(property.valueType);

// The global catalog includes bundles kept only for rendering older screens; only selected qualified entries are offered.
export const supportedDraftComponents = (runtime: ScreenEditorRuntime) => runtime.catalog.components.filter(component => {
    const separator = component.component.indexOf(':');
    const packageName = component.component.slice(0, separator);
    return separator > 0 && ['core', ...runtime.profile.packages].includes(packageName) && runtime.isKnownComponent(component.component.slice(separator + 1)) &&
        standaloneControls.has(runtime.packageDescriptorOf(component).component);
});

export function sceneScreenDraftRequest(instruction: string, document: SceneDocument, runtime: ScreenEditorRuntime): SceneScreenDraftRequest {
    if (!instruction.trim() || instruction.length > 4_000) throw new Error('Describe the additions in at most 4,000 characters.');
    const catalogue = {
        components: supportedDraftComponents(runtime).map(component => ({
            component: component.component,
            properties: component.properties.filter(supportedDraftProperty),
            emptyElement: createExternalComponent('new-unique-id', 'Label', component.component),
        })),
        panels: [createPanel(LayoutItem.Stack, 'new-stack-id', 'Stack'), createPanel(LayoutItem.Row, 'new-row-id', 'Row')],
        queryDisplaySupported: false,
        editKinds: ['insertNode', 'setProperty'],
        limits: 'Layout only: add labels, ordinary inputs and empty Stack/Row containers. Set described scalar properties only. Query bindings unsupported. Schemas are informational context only. Inputs and buttons have no runnable command or form. No queries, views, slots, actions, forms, templates or replacement.',
    };
    const request = { instruction, catalogue: JSON.stringify(catalogue), document: JSON.stringify({ root: authoredRoot(document) }) };
    if (request.catalogue.length > 400_000 || request.document.length > 400_000) throw new Error('The screen context is too large to generate a draft.');
    return request;
}
