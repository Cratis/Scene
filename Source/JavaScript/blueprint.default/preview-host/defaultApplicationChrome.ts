// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LogoKind, type ApplicationLogo } from '@cratis/scene.model';
import type { ResolvedProfileIdentity } from '@cratis/scene.engine';
import type { SceneElement } from '@cratis/scene.model';
import { ComponentName } from '../ComponentName';
import { externalComponent } from '../gallery/elements';
import { SlotName } from '../layouts';

/**
 * The chrome the application shell wraps every screen in when the model supplies navigation: a topbar and a sidebar. Neither
 * carries items - each shows the effective navigation of its region (`NavigationRegionView`), so inherit/extend/override
 * applies and nothing here knows the items. The logo is the application's (`navigation.application.logo`).
 *
 * @param logo The application's logo, when it has one.
 * @returns The slot content to give the shell.
 */
export function defaultApplicationChrome(logo?: ApplicationLogo, identity?: ResolvedProfileIdentity): Record<string, SceneElement[]> {
    const slots: Record<string, SceneElement[]> = {};
    if (identity) {
        slots.logo = [externalComponent('topbar-logo', ComponentName.Logo, {
            label: identity.name,
            initials: identity.initials,
            iconName: identity.kind === LogoKind.Icon ? identity.icon : undefined,
            lightImageUrl: identity.kind === LogoKind.Image ? identity.image : undefined,
            showName: identity.showName,
            targetScreen: '',
        })];
    } else if (logo) {
        slots.logo = [externalComponent('topbar-logo', ComponentName.Logo, {
            label: logo.title,
            initials: logo.title.slice(0, 1).toUpperCase(),
            lightImageUrl: logo.image || undefined,
            targetScreen: '',
        })];
    }

    return {
        [SlotName.Topbar]: [externalComponent('topbar', ComponentName.Topbar, {}, slots)],
        [SlotName.Sidebar]: [externalComponent('sidebar', ComponentName.Sidebar, {})],
        // No authored trail: the breadcrumb follows where the host is (spec N4) - the module and features down to the screen on the page.
        [SlotName.Breadcrumb]: [externalComponent('breadcrumb', ComponentName.Breadcrumb, {})],
    };
}
