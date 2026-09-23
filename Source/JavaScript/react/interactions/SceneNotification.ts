// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NotificationLevel } from '@cratis/scene.model';

/**
 * Something a document asked to be said, waiting to be seen.
 */
export interface SceneNotification {
    /** Identifies the notification for the lifetime of the surface showing it. */
    readonly id: number;

    /** How the document classified it. */
    readonly level: NotificationLevel;

    /** What it says, already resolved against the interaction's context. */
    readonly message: string;
}
