// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What one screen relies on, which a profile change must still supply. The host reads it from its documents. */
export interface ProfileUsage {
    /** The screen's name, shown in the message. */
    screen: string;

    /** The layouts it uses. */
    layouts: string[];

    /** The screen templates it uses. */
    screenTemplates: string[];

    /** The dialog templates it uses. */
    dialogTemplates: string[];

    /** The slots it fills, by the layout or template that owns them. */
    slots: { owner: string; slot: string }[];
}
