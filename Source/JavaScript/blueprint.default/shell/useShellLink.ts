// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { MouseEvent, useCallback, useMemo } from 'react';
import { DestinationReference } from '@cratis/scene.model';
import { NavigationActivationRequest, resolveDestination, useNavigationActivation, useOptionalSceneNavigation } from '@cratis/scene.react';

/** What a shell control needs to be a link that navigates. */
export interface ShellLink {
    /** The address of the link, for opening it in a new tab and for assistive technology; never written by a plain click inside a host. */
    href?: string;

    /** Whether the screen the link opens is the one in the host's primary region; undefined outside a host, where the caller's static state stands. */
    current?: boolean;

    /** Whether the link leads nowhere: a host is in scope and the target is missing or is not a screen the host renders (`navTargetMissing`, spec N8). */
    dead: boolean;

    /** The click handler: navigates through the host's navigation context; outside a host the browser follows the href. */
    onClick(event: MouseEvent): void;
}

/**
 * Makes a shell control - a menu entry, a crumb, the logo, a user-menu entry - navigate (spec N1, N4).
 *
 * Inside a navigation host the click goes through the host's navigation context: the target is rendered in its slot, the history
 * records it, the control is current while its screen is on the page, and the address of the page that hosts the application is not
 * written. Outside a host the control stays an ordinary hash link, so a Storybook story or a static render keeps working.
 *
 * @param targetScreen The screen the control opens.
 * @param request What to tell the host about the control: its source, id and label.
 */
export function useShellLink(targetScreen: string | undefined, request: Omit<NavigationActivationRequest, 'destination'>): ShellLink {
    const navigation = useOptionalSceneNavigation();
    const activator = useNavigationActivation();
    const destination = useMemo<DestinationReference | undefined>(() => targetScreen ? { screen: targetScreen } : undefined, [targetScreen]);
    const url = destination ? resolveDestination(destination).url : undefined;

    const onClick = useCallback((event: MouseEvent) => {
        if (!activator.hosted || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        activator.activate({ ...request, destination }, event);
    }, [activator, destination, request.id, request.label, request.source]);

    return {
        href: url ? `#/${url}` : undefined,
        current: navigation && targetScreen ? navigation.primaryScreen === targetScreen : undefined,
        dead: activator.hosted && !activator.resolves(destination),
        onClick,
    };
}
