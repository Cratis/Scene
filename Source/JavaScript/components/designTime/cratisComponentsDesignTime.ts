// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeBundle } from '@cratis/scene.react';
import { CommandFieldPropertyEditor } from '../forms/CommandFieldPropertyEditor';
import { CommandFormDesigner } from '../forms/CommandFormDesigner';
import { CommandFormLayoutEditor } from '../forms/CommandFormLayoutEditor';
import { generateCommandFieldsAction } from '../forms/generateCommandFieldsAction';

/** Every design-time contribution of `Cratis.Components`, under the names its manifest declares. */
export const cratisComponentsDesignTime: DesignTimeBundle = {
    designers: {
        commandFormDesigner: CommandFormDesigner,
    },
    propertyEditors: {
        commandBinding: CommandFieldPropertyEditor,
        commandFormLayout: CommandFormLayoutEditor,
    },
    actions: {
        [generateCommandFieldsAction.descriptor.id]: generateCommandFieldsAction,
    },
};
