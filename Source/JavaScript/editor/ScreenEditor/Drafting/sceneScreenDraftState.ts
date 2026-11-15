// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';

// The private candidate being built: the document so far, every ID in use and the IDs this draft added.
export interface DraftState {
    document: SceneDocument;
    readonly used: Set<string>;
    readonly added: Set<string>;
}
