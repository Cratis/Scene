// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { JsonObject } from './json';
import { elementFrameDefaults } from './sceneElementFrame';

// The mirror of SceneElementImport.Base: an element with the id and name it is given, the placement every element
// carries at the editor's defaults, and no properties yet.
export const baseElement = (id: string, name: string): JsonObject => ({
    id,
    name,
    ...elementFrameDefaults(),
    properties: {},
});
