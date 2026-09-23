// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NotificationLevel } from '@cratis/scene.model';
import { SceneNotification } from './SceneNotification';

/**
 * The properties of {@link NotificationHost}.
 */
export interface NotificationHostProps {
    /** What is currently being said, oldest first. */
    readonly notifications: readonly SceneNotification[];

    /** Called when one is dismissed. */
    readonly onDismiss: (id: number) => void;
}

const colours: Record<NotificationLevel, string> = {
    [NotificationLevel.Info]: '#1e6fbf',
    [NotificationLevel.Warning]: '#b8860b',
    [NotificationLevel.Error]: '#c0392b',
};

/**
 * Shows what a document's `notify` asked to say.
 *
 * Deliberately plain. An application with a design system of its own passes its own `notify` to the dispatcher
 * and never renders this; what this exists for is that the default is *something* rather than a console line
 * nobody is looking at.
 * @param props The {@link NotificationHostProps}.
 */
export function NotificationHost({ notifications, onDismiss }: NotificationHostProps) {
    if (notifications.length === 0) return null;

    return (
        <div role="log" aria-live="polite" data-scene-notifications style={{ position: 'fixed', top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1000 }}>
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    data-scene-notification={notification.level}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '24rem', padding: '0.625rem 0.75rem', borderRadius: 4, border: `1px solid ${colours[notification.level]}`, borderLeftWidth: 4, background: '#fff', color: '#1a1a1a' }}>
                    <span style={{ flex: 1 }}>{notification.message}</span>
                    <button type="button" aria-label="Dismiss" onClick={() => onDismiss(notification.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>x</button>
                </div>
            ))}
        </div>
    );
}
