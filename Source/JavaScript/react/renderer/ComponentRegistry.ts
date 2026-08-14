// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentType, ReactNode } from 'react';
import { ExternalComponent } from '@cratis/scene.model';

/**
 * The props every registered component receives.
 */
export interface RegisteredComponentProps {
    element: ExternalComponent;
    slots: Record<string, ReactNode[]>;
}

/**
 * Maps a resolved component name (as `ExternalComponent.componentName` already carries it, post
 * `ui profile` package resolution) to the React component that renders it. Real bare-name resolution
 * against a profile's package list is Scene#3's job - this registry is keyed by the already-resolved
 * name.
 */
export type ComponentRegistry = Record<string, ComponentType<RegisteredComponentProps>>;
