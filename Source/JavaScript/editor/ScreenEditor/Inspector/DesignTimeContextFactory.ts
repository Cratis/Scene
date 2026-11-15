// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentDescriptor, ExternalComponent, SceneEdit } from '@cratis/scene.model';
import type { DesignTimeActionContext } from '@cratis/scene.react';
import { screenName } from '../Document/studioScreen';
import { sliceNamedBy } from '../Actions/StateChangeSlice';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';

// What a package is told of the command a form presents: the inputs the command needs, in the order it declares them. The editor knows them
// from the slice the form's command names, so a package's designer or action can work from the same fields the form editor offers.
function commandMetadataOf(component: ExternalComponent, environment: ScreenEditorEnvironment): DesignTimeActionContext['commandMetadata'] {
    const slice = sliceNamedBy(environment.stateChangeSlices, component.properties.command);
    return slice ? { properties: slice.inputs.map(input => ({ name: input.name, type: input.type })) } : undefined;
}

export function createDesignTimeContext(component: ExternalComponent, descriptor: ComponentDescriptor, controller: ScreenEditorController, environment: ScreenEditorEnvironment, label: string): DesignTimeActionContext {
    const commandMetadata = commandMetadataOf(component, environment);
    let running = false;
    const context: DesignTimeActionContext = {
        element: component,
        root: controller.composition.element,
        screen: controller.document.screens.find(candidate => candidate.name === screenName),
        descriptor,
        profile: environment.runtime.profile,
        bundles: environment.runtime.bundles,
        permissions: {},
        // A package's own designer asks the host whether it can generate the fields of a command form; it can when the form's command is known.
        capabilities: commandMetadata ? { 'commandForm.generateFields': true } : {},
        diagnostics: [],
        commandMetadata,
        // Both go through the editor session, which applies a batch all or none and records it as one undo step.
        submitEdits: (edits: SceneEdit[]) => { controller.applyAll(edits, label); },
        submitAction: (actionId: string, edits: SceneEdit[]) => {
            // A designer's button names the action without its edits; the host runs the action, which comes back here with the batch it made.
            if (edits.length === 0 && !running) {
                running = true;
                try {
                    environment.runtime.designTime.runAction(descriptor, actionId, context);
                } finally {
                    running = false;
                }
                return;
            }

            controller.applyAll(edits, label);
        },
    };
    return context;
}
