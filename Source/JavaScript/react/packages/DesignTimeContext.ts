// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    ComponentDescriptor,
    EffectiveConfiguration,
    ExternalComponent,
    SceneEdit,
    SceneElement,
    Screen,
    UiProfile,
} from '@cratis/scene.model';
import { BindingDiagnostic } from '@cratis/scene.engine';
import { ScenePackageBundle } from './ScenePackageBundle';

/**
 * Canonical Scene state and host capabilities a package-side design-time contribution may read and edit.
 */
export interface DesignTimeContext {
    element: ExternalComponent;
    root: SceneElement;
    screen?: Screen;
    descriptor: ComponentDescriptor;
    configuration?: EffectiveConfiguration;
    profile: UiProfile;
    bundles: ScenePackageBundle[];
    permissions: Record<string, boolean>;
    capabilities: Record<string, boolean>;
    diagnostics: BindingDiagnostic[];
    submitEdits(edits: SceneEdit[]): void;
    submitAction(actionId: string, edits: SceneEdit[]): void;
}
