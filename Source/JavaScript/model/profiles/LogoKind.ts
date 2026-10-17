// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** How the application's logo is made: characters on the accent block, an icon on the accent block, or the author's own image. */
export enum LogoKind {
    /** One or two characters on a block in the accent colour. The default. */
    Initials = 'Initials',

    /** One icon from the closed set of logo icons on a block in the accent colour. */
    Icon = 'Icon',

    /** The author's own image, drawn without the accent block. */
    Image = 'Image',
}
