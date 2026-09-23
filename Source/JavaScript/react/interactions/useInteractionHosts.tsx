// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { NotificationLevel } from '@cratis/scene.model';
import { BrowserDispatcherHost } from './createBrowserDispatcher';
import { ConfirmHost } from './ConfirmHost';
import { ConfirmRequest } from './ConfirmRequest';
import { NotificationHost } from './NotificationHost';
import { SceneNotification } from './SceneNotification';
import { UnresolvedAction } from './UnresolvedAction';
import { UnresolvedActionHost } from './UnresolvedActionHost';

/**
 * What {@link useInteractionHosts} gives an application.
 */
export interface InteractionHosts {
    /** The parts of a {@link BrowserDispatcherHost} these surfaces provide. Spread it into the host you build. */
    readonly host: Pick<BrowserDispatcherHost, 'notify' | 'confirm' | 'onUnsupported'>;

    /** The surfaces themselves. Render them once, anywhere inside the application. */
    readonly surfaces: ReactNode;
}

/**
 * How long a notification stays before it removes itself, in milliseconds.
 */
export interface InteractionHostOptions {
    /** How long a notification stays up. `0` keeps it until it is dismissed. */
    readonly dismissAfter?: number;
}

/**
 * Provides the default surfaces for the actions that need somewhere to appear.
 *
 * `notify` and `confirm` are the two actions a document can take that have no backend and no route: they are
 * purely things the user sees. Without a surface, a host either invents one or the action goes to the console,
 * which is why these ship with Scene rather than being every application's first chore.
 *
 * The three are returned as one unit because they are wired the same way and forgetting to render one of them
 * is exactly the failure they exist to prevent:
 *
 * ```tsx
 * const { host, surfaces } = useInteractionHosts();
 * const dispatcher = useMemo(() => createBrowserDispatcher({ ...host, executeCommand, navigate }), [host]);
 *
 * return <InteractionScope dispatcher={dispatcher}>{children}{surfaces}</InteractionScope>;
 * ```
 *
 * An application with a design system of its own passes its own `notify` after the spread and keeps the rest.
 * @param options The {@link InteractionHostOptions}.
 * @returns The {@link InteractionHosts}.
 */
export function useInteractionHosts(options: InteractionHostOptions = {}): InteractionHosts {
    const { dismissAfter = 6000 } = options;
    const [notifications, setNotifications] = useState<readonly SceneNotification[]>([]);
    const [unresolved, setUnresolved] = useState<readonly UnresolvedAction[]>([]);
    const [request, setRequest] = useState<ConfirmRequest | undefined>(undefined);
    const nextId = useRef(0);

    const dismiss = useCallback((id: number) => setNotifications(current => current.filter(_ => _.id !== id)), []);

    const notify = useCallback((level: NotificationLevel, message: string) => {
        const id = nextId.current++;
        setNotifications(current => [...current, { id, level, message }]);

        if (dismissAfter > 0) {
            setTimeout(() => setNotifications(current => current.filter(_ => _.id !== id)), dismissAfter);
        }
    }, [dismissAfter]);

    const confirm = useCallback((message: string) => new Promise<boolean>(resolve => {
        setRequest({
            message,
            answer(confirmed) {
                // Cleared before resolving, so the sequence that continues cannot find a question on screen
                // that has already been answered.
                setRequest(undefined);
                resolve(confirmed);
            },
        });
    }), []);

    const onUnsupported = useCallback((action: string) => {
        // Reported once per distinct action. An unsupported action on a hover or an interval would otherwise
        // grow the list until it covered the application it is trying to tell you about.
        setUnresolved(current => current.some(_ => _.action === action) ? current : [...current, { id: nextId.current++, action }]);
    }, []);

    const host = useMemo(() => ({ notify, confirm, onUnsupported }), [notify, confirm, onUnsupported]);

    const surfaces = useMemo(() => (
        <>
            <NotificationHost notifications={notifications} onDismiss={dismiss} />
            <ConfirmHost request={request} />
            <UnresolvedActionHost unresolved={unresolved} />
        </>
    ), [notifications, dismiss, request, unresolved]);

    return { host, surfaces };
}
