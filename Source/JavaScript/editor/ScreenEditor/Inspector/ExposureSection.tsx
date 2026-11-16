// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { NodeInspection } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import { defaultCollectionOperations, exposePropertyEdit, isExposed, unexposePropertyEdit } from '../Exposure/exposureEdits';
import { PropertyValueType } from '@cratis/scene.model';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface ExposureSectionProps {
    inspection: NodeInspection;
    componentId: string;
    controller: ScreenEditorController;
    strings: ScreenEditorStrings;
    authoringTemplate?: string;
}

// Shown only while authoring a template: which of the selected component's properties the scopes that use the template
// may configure. A collection is exposed with the operations scopes get on it; anything else is exposed as a value.
export const ExposureSection = ({ inspection, componentId, controller, strings, authoringTemplate }: ExposureSectionProps) => {
    const text = strings.properties;
    if (authoringTemplate === undefined) return null;

    const candidates = inspection.properties.filter(property => property.descriptor.valueType !== PropertyValueType.Object && property.descriptor.group !== 'Placement');
    if (candidates.length === 0) return null;

    return (
        <section className='studio-editor-properties__exposure'>
            <strong>{text.exposure}</strong>
            <ul>
                {candidates.map(property => {
                    const path = property.descriptor.path;
                    const exposed = isExposed(controller.document, authoringTemplate, componentId, path);
                    const isCollection = property.descriptor.valueType === PropertyValueType.Collection;
                    return (
                        <li key={path}>
                            <label>
                                <input
                                    type='checkbox'
                                    checked={exposed}
                                    onChange={event => controller.apply(
                                        event.target.checked
                                            ? exposePropertyEdit(authoringTemplate, componentId, path, isCollection ? { operations: defaultCollectionOperations } : {})
                                            : unexposePropertyEdit(authoringTemplate, componentId, path),
                                        exposed ? text.unexposeProperty : text.exposeProperty)}
                                />
                                <span>{property.descriptor.label}</span>
                                {exposed && <em>{text.exposedToScopes}</em>}
                            </label>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};
