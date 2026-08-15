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
 * `ui profile` package resolution) to the React component that renders it. Bare-name resolution against a
 * profile's package list is `resolveComponentName` in `@cratis/scene.engine` (Cratis/Scene#3) - this
 * registry is keyed by the already-resolved name; wiring the two together (resolving an entire element
 * tree's component names before it reaches this registry) is Stage#39/StudioIssues#160's job, not this
 * registry's.
 */
export type ComponentRegistry = Record<string, ComponentType<RegisteredComponentProps>>;
