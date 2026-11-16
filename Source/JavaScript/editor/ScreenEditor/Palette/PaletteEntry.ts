// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { LayoutItem } from '../Layouts/LayoutItem';
import { isDataField, type DataField } from '../Data/DataField';

// What dropping or activating a palette item adds: a layout container, or a component of a package.
export type PalettePayload =
    | { kind: 'layout'; item: LayoutItem }
    | { kind: 'component'; componentName: string; package: string }
    // Something from the Data drawer: dropped, it becomes a field bound to it.
    | { kind: 'field'; field: DataField };

export const isPalettePayload = (value: unknown): value is PalettePayload => {
    const payload = value as Partial<PalettePayload> | null | undefined;
    return !!payload && ((payload.kind === 'layout' && typeof (payload as { item?: unknown }).item === 'string')
        || (payload.kind === 'component' && typeof (payload as { componentName?: unknown }).componentName === 'string' && typeof (payload as { package?: unknown }).package === 'string')
        || (payload.kind === 'field' && isDataField((payload as { field?: unknown }).field)));
};
