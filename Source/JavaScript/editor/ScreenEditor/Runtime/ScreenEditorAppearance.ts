// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Theme } from '@cratis/scene.model';

// How the host that draws the editor wants the screens in it to look. A host that sits inside a look of its own - Studio is dark, with a palette
// of its own - hands the editor that look here, so the screen on the surface and the screen played beside it belong to the host the way its other
// panels do. The editor owns no host's palette: it draws with whatever theme it is given.
//
// The theme replaces the one the UI profile names for what the editor draws and plays. The profile's own theme is what the application ships
// with, and is still what the UI Profile workspace previews. A host that gives no appearance gets the profile's theme, as before.
export interface ScreenEditorAppearance {
    theme: Theme;
}
