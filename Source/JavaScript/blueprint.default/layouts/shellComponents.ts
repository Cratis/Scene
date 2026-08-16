// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentName } from '../ComponentName';
import { LayoutName } from './LayoutName';

/**
 * Which component renders which layout.
 *
 * A {@link Layout} is data - named slots and an arrangement - and says nothing about how it is drawn. This
 * is the one place that pairing lives, so a host holding a screen and its layout name can find the shell
 * to render it in without hardcoding the answer, and a spec can prove every layout the blueprint declares
 * actually has one.
 */
const shellComponents: Record<LayoutName, ComponentName> = {
    [LayoutName.AppShell]: ComponentName.AppShell,
    [LayoutName.FullPage]: ComponentName.FullPageShell,
};

/**
 * The component that renders a layout.
 *
 * @param layoutName The layout's name.
 * @returns The bare component name, or `undefined` when the layout is not one of this blueprint's.
 */
export function shellComponentForLayout(layoutName: string): ComponentName | undefined {
    return shellComponents[layoutName as LayoutName];
}
