// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Outlet } from '@cratis/scene.model';

/**
 * An outlet together with the layout or screen template that declares it.
 */
export interface OutletOwner {
    outlet: Outlet;
    owner: string;
    ownerKind: 'Layout' | 'ScreenTemplate';
}
