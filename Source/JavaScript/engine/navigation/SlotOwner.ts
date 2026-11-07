// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Slot } from '@cratis/scene.model';

/**
 * A slot together with the layout or screen template that declares it.
 */
export interface SlotOwner {
    slot: Slot;
    owner: string;
    ownerKind: 'Layout' | 'ScreenTemplate';
}
