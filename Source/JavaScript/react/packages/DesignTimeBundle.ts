// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentType } from 'react';
import { DesignTimeAction } from './DesignTimeAction';
import { DesignTimeComponentProps } from './DesignTimeComponentProps';
import { DesignTimePropertyDisplayProps } from './DesignTimePropertyDisplayProps';
import { DesignTimePropertyEditorProps } from './DesignTimePropertyEditorProps';

/**
 * Optional React-only design-time surface a package may publish beside its runtime bundle.
 */
export interface DesignTimeBundle {
    previews?: Record<string, ComponentType<DesignTimeComponentProps>>;
    designers?: Record<string, ComponentType<DesignTimeComponentProps>>;
    propertyEditors?: Record<string, ComponentType<DesignTimePropertyEditorProps>>;
    propertyDisplays?: Record<string, ComponentType<DesignTimePropertyDisplayProps>>;
    actions?: Record<string, DesignTimeAction>;
}

export function validateDesignTimeBundle(bundle: DesignTimeBundle | undefined): string[] {
    if (!bundle) return [];
    const problems: string[] = [];
    for (const [name, action] of Object.entries(bundle.actions ?? {})) {
        if (action.descriptor.id !== name) {
            problems.push(`registers design-time action '${name}' with descriptor id '${action.descriptor.id}'`);
        }
    }
    return problems;
}
