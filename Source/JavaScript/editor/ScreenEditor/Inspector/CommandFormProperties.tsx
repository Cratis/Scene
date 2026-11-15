// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { commandEdit, commandProperty } from '../Forms/commandFormElements';
import { autoFormFor } from '../Forms/formEditing';
import { screenName } from '../Document/studioScreen';
import { CommandFormEditor } from './CommandFormEditor';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface CommandFormPropertiesProps {
    elementId: string;

    properties: Record<string, unknown> | undefined;
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    disabled: boolean;
}

export const CommandFormProperties = ({ elementId, properties, controller, environment, strings, disabled }: CommandFormPropertiesProps) => {
    const screenForms = controller.document.screens.find(candidate => candidate.name === screenName)?.forms ?? [];
    const command = properties?.[commandProperty];
    return (
        <CommandFormEditor
            elementId={elementId}
            command={typeof command === 'string' ? command : undefined}
            slices={environment.stateChangeSlices}
            queries={environment.queryCandidates}
            forms={screenForms}
            strings={strings}
            disabled={disabled}
            onCommandChange={slice => {
                const result = controller.applyAll([commandEdit(elementId, slice)], strings.properties.commandForm.label);
                // Choosing a command gives the element a form for it, so there is something to author straight away.
                if (result.applied && slice && !screenForms.some(form => form.forCommand === slice.name)) controller.setScreenForms([...screenForms, autoFormFor(slice)], strings.properties.commandForm.createForm(slice.name));
            }}
            onFormChange={form => controller.setScreenForms(screenForms.map(candidate => candidate.forCommand === form.forCommand ? form : candidate), strings.properties.forms.label)}
            onFormCreate={slice => controller.setScreenForms([...screenForms, autoFormFor(slice)], strings.properties.commandForm.createForm(slice.name))}
        />
    );
};
