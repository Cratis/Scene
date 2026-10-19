// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference } from '@cratis/scene.model';
import { EffectiveNavButton, EffectiveNavItem } from '@cratis/scene.engine';
import { DestinationResolution } from './DestinationResolution';
import { NavigationMode } from './NavigationMode';

/** What was activated: a navigation item, a menu entry, a breadcrumb crumb, a logo or a user-menu entry. */
export interface NavigationActivationRequest {
    /** Where the control leads; undefined for a control with no target. */
    destination?: DestinationReference;

    /** The control's stable id - the effective item's id for a region item, the element id for a menu entry. */
    id?: string;

    /** What the control says. */
    label?: string;

    /** The kind of control, for a host that treats them differently: `region`, `regionButton`, `menu`, `breadcrumb`, `logo`, `userMenu`. */
    source: string;

    /** The effective navigation item, for an item of a navigation region. */
    item?: EffectiveNavItem;

    /** The effective application toolbar button, for a button of a navigation region. */
    button?: EffectiveNavButton;
}

/** What happened when a control was activated; handed to the host's `onActivate`. */
export interface NavigationActivation {
    request: NavigationActivationRequest;

    /** Whether the activation navigated or only selected. */
    mode: NavigationMode;

    /** Whether the destination exists in the host: its screen is one the host renders. False for a control with no target (`navTargetMissing`). */
    resolves: boolean;

    /** Whether the host opened the destination. */
    navigated: boolean;

    /** How the destination resolved, when it was opened. */
    resolution?: DestinationResolution;
}
