// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { InspectedProperty } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import { nextElementId } from '../Host/nextElementId';
import { defaultDesignModeStrings } from '../DesignMode/DesignModeStrings';
import { designModeActions } from '../DesignMode/designModeTypes';
import { createOutletItemSource } from '../DesignMode/outletItemSource';
import type { EditorContext } from '../PropertyEditors/Registry/PropertyEditorProps';
import type { PropertyEditorRegistry } from '../PropertyEditors/Registry/PropertyEditorRegistry';
import { PropertyEditorHost } from '../PropertyEditors/Registry/PropertyEditorHost';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import { localizedDisplay } from './localizedDisplay';

export interface OutletButtonSectionProps {
    controller: ScreenEditorController;
    strings: ScreenEditorStrings;
    componentId: string;

    // The outlet's `items` property, as the inspection of the outlet element has it.
    items: InspectedProperty;
    registry: PropertyEditorRegistry;
    context: EditorContext;
}

// The fields of the button the design mode has selected in an outlet of actions - the toolbar since Scene 5, where a button is an item of the outlet rather than an
// element of its own. The slice and the emphasis are drawn by the editor the floating toolbar's chips draw them with, what the button shows (Scene 5.1's `display`, which
// has no chip) by the same registry, and every change is the same edit of the outlet.
export const OutletButtonSection = ({ controller, strings, componentId, items, registry, context }: OutletButtonSectionProps) => {
    const text = (strings.designMode ?? defaultDesignModeStrings).toolbar;
    const source = createOutletItemSource({ componentId, property: items, newId: nextElementId, startingLabel: text.toolbarButton, structure: controller.structure });
    const item = source.items.find(candidate => candidate.id === controller.selectedItemId);
    if (!item) return null;

    const choices = [designModeActions.slice, designModeActions.emphasis, designModeActions.display]
        .map(actionId => ({ actionId, choice: source.choice(actionId, item) }))
        .flatMap(({ actionId, choice }) => choice ? [{ actionId, choice }] : []);
    const change = (actionId: string, value: unknown) => {
        const outcome = choices.find(candidate => candidate.actionId === actionId)?.choice.plan(value);
        if (outcome && !('rejected' in outcome)) controller.applyAll(outcome.edits, outcome.label);
    };

    return (
        <section className='studio-editor-properties__outlet-button' data-section='outletButton'>
            {choices.map(({ actionId, choice }) => (
                <div key={`${item.id}-${actionId}`}>
                    <PropertyEditorHost registry={registry} property={actionId === designModeActions.display ? localizedDisplay(choice.property, text) : choice.property} context={context} componentId={componentId} onChange={(_, value) => change(actionId, value)} diagnostics={[]} />
                    {actionId === designModeActions.slice && <p className='studio-editor-properties__hint'>{text.sliceHelp}</p>}
                </div>
            ))}
        </section>
    );
};
