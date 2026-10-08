// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeActionDescriptor, SceneEdit } from '@cratis/scene.model';
import { DesignTimeContext } from './DesignTimeContext';

export interface DesignTimeActionContext extends DesignTimeContext {
    commandMetadata?: { properties: { name: string; type: string; label?: string }[] };
}

export interface DesignTimeActionResult {
    edits: SceneEdit[];
    diagnostics: string[];
}

/**
 * Executable package-owned design-time action. Hosts apply the returned edit batch through their own undo/redo.
 */
export interface DesignTimeAction {
    descriptor: DesignTimeActionDescriptor;
    isVisible(context: DesignTimeActionContext): boolean;
    isEnabled(context: DesignTimeActionContext): boolean;
    execute(context: DesignTimeActionContext): DesignTimeActionResult;
}
