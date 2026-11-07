// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, useContext } from 'react';
import { SceneElement } from '@cratis/scene.model';
import { ComponentRegistry } from '../renderer';

/** What a nested slot needs to render the screen placed in it. */
export interface SceneSlotContextValue {
    screens: Record<string, SceneElement>;
    registry: ComponentRegistry;
}

export const SceneSlotContext = createContext<SceneSlotContextValue | undefined>(undefined);

/** The screens and registry of the enclosing navigation host, or undefined outside one. */
export function useSceneSlots(): SceneSlotContextValue | undefined {
    return useContext(SceneSlotContext);
}
