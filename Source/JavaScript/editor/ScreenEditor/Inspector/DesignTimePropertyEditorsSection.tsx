// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentDescriptor, ExternalComponent, InspectedProperty } from '@cratis/scene.model';
import { ErrorBoundary } from '@cratis/components/Common';
import { createDesignTimeContext } from './DesignTimeContextFactory';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface DesignTimePropertyEditorsSectionProps {
    component: ExternalComponent;
    descriptor: ComponentDescriptor;
    properties: readonly InspectedProperty[];
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    disabled: boolean;
}

// The property editors a package contributes for its own properties, resolved by Scene's design-time host from each
// property's editor kind. A kind the editor draws itself, or one no package provides, is left to the inspector's own
// controls; a package editor that fails while drawing is replaced by a note.
export const DesignTimePropertyEditorsSection = ({ component, descriptor, properties, controller, environment, strings, disabled }: DesignTimePropertyEditorsSectionProps) => {
    const { designTime, packageDescriptorOf } = environment.runtime;
    const packageDescriptor = packageDescriptorOf(descriptor);
    const editors = properties.flatMap(property => {
        const Editor = designTime.propertyEditor(packageDescriptor, property.descriptor).contribution;
        return Editor ? [{ property, Editor }] : [];
    });
    if (editors.length === 0) return null;

    return (
        <fieldset className='studio-editor-properties__property-editors' disabled={disabled}>
            <legend>{strings.properties.designTimePropertyEditors}</legend>
            {editors.map(({ property, Editor }) => (
                <ErrorBoundary key={property.descriptor.path} fallback={<p className='studio-editor-binding__missing' role='alert'>{strings.properties.designerFailed(property.descriptor.label)}</p>}>
                    <Editor
                        context={createDesignTimeContext(component, packageDescriptor, controller, environment, property.descriptor.label)}
                        property={property.descriptor}
                        value={property.effectiveValue}
                        // A package editor writes through the context's submitEdits as Scene edits; setValue only tells
                        // it what to show, so a value is never written twice.
                        setValue={() => undefined}
                    />
                </ErrorBoundary>
            ))}
        </fieldset>
    );
};
