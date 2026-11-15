// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { bindingSourceInventory } from '../Binding/bindingSources';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { commandInputSources } from '../Actions/commandInputSources';
import { actionEdits, readActionModel } from '../Actions/actionBehavior';
import { ActionEditor } from './ActionEditor';
import type { PlacementEnvironment } from '../Placement/hookPlacement';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface ActionPropertiesProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    elementId: string;
    properties: Record<string, unknown> | undefined;
    disabled: boolean;
    placement?: PlacementEnvironment;
}

export const ActionProperties = ({ controller, environment, strings, elementId, properties, disabled, placement }: ActionPropertiesProps) => {
    const bindingSources = useMemo(
        () => bindingSourceInventory(controller.document, controller.composition.roots, controller.context, environment.availableSources, environment.queryCandidates),
        [controller.document, controller.composition.roots, controller.context, environment.availableSources, environment.queryCandidates]);

    return (
        <ActionEditor
            action={readActionModel(properties, environment.stateChangeSlices.find(slice => slice.id === (properties?.command as string))?.name ?? '')}
            slices={environment.stateChangeSlices}
            sources={commandInputSources(Object.keys(environment.availableSources), bindingSources.componentOutputs, elementId)}
            strings={strings}
            disabled={disabled}
            {...(placement ? { placement } : {})}
            suggestSource={name => name === 'id' || name.endsWith('Id') ? 'row.id' : undefined}
            onChange={action => action && controller.applyAll(actionEdits(elementId, action, properties), strings.properties.action.label)}
        />
    );
};
