// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { InspectedProperty, SceneDiagnostic } from '@cratis/scene.model';
import { PropertyEditorHost } from '../PropertyEditors/Registry/PropertyEditorHost';
import { withSession, type EditorContextInputs } from '../PropertyEditors/Registry/createEditorContext';
import type { ScreenEditorController } from '../Host/ScreenEditorController';

type EditorContext = Parameters<typeof withSession>[0];
type Registry = Parameters<typeof PropertyEditorHost>[0]['registry'];

export interface PropertyGroupsProps {
    groups: { name: string; properties: InspectedProperty[] }[];
    selectedId: string;
    registry: Registry;
    baseContext: EditorContext;
    editorInputs: EditorContextInputs;
    diagnostics: SceneDiagnostic[];
    onChange: ScreenEditorController['setProperty'];
}

export const PropertyGroups = ({ groups, selectedId, registry, baseContext, editorInputs, diagnostics, onChange }: PropertyGroupsProps) => (
    <>
        {groups.map(group => (
            <section key={group.name} className='studio-editor-properties__group' aria-label={group.name}>
                <h4 className='studio-editor-properties__group-title'>{group.name}</h4>
                {group.properties.map(property => (
                    <PropertyEditorHost
                        key={`${selectedId}:${property.descriptor.path}`}
                        registry={registry}
                        property={property}
                        context={withSession(baseContext, editorInputs, property)}
                        componentId={selectedId}
                        onChange={onChange}
                        diagnostics={diagnostics}
                    />
                ))}
            </section>
        ))}
    </>
);
