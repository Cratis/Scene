// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataBinding } from './SampleDataBinding';
import { SampleDataMapping } from './SampleDataMapping';

/**
 * Which sample data an application previews with: the active pack, the shape→read-model mapping table and
 * any per-read-model pack bindings. It is carried by the application's {@link UiProfile} (`sampleData`), so
 * the choice is made once for the whole application and inherited by every screen, slice and component; it
 * is never chosen per screen.
 */
export interface SampleDataSelection {
    /** The application's active pack identity (an own pack or a blueprint's). Absent falls through to the blueprint's default pack, then generated data. */
    activePack?: string;

    /** Explicit `shape → read model` mappings, for where a pack's shape name is not the read model's name. */
    mappings: SampleDataMapping[];

    /** Per read model or shape pack bindings; each overrides the active pack for its target. */
    bindings: SampleDataBinding[];
}

export const SampleDataSelectionPropertyNames: (keyof SampleDataSelection)[] = ['activePack', 'mappings', 'bindings'];
