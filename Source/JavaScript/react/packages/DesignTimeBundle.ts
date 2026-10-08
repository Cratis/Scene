// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentType, ReactNode } from 'react';
import { DesignTimeAction } from './DesignTimeAction';

/**
 * Optional React-only design-time surface a package may publish beside its runtime bundle.
 */
export interface DesignTimeBundle {
    previews?: Record<string, ComponentType<{ children?: ReactNode }>>;
    designers?: Record<string, ComponentType<{ children?: ReactNode }>>;
    propertyEditors?: Record<string, ComponentType<Record<string, unknown>>>;
    propertyDisplays?: Record<string, ComponentType<{ value: unknown }>>;
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
