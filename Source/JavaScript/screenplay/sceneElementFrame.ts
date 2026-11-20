// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { JsonObject } from './json';

// The mirror of SceneElementFrame: the members every Scene element carries for its own placement. Screenplay has
// no element geometry, so an element made from a Screenplay directive carries exactly the values the editor gives
// a new one.
export const panelComponent = 'panel';
export const panelChildren = 'children';

export const elementFrameDefaults = (): JsonObject => ({
    visibility: 'Visible',
    isEnabled: true,
    opacity: 1,
    size: {},
    zIndex: 0,
    minimumSize: {},
    maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 },
    horizontalAlignment: 'Stretch',
    verticalAlignment: 'Stretch',
});
