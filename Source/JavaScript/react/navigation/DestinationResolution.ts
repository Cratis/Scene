// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind } from '@cratis/scene.model';

export interface DestinationResolution {
    kind: DestinationKind;
    url?: string;
    outlet?: string;
    dialog?: string;
    action: 'navigate' | 'openDialog' | 'openExternal';
    diagnostics: string[];
}
