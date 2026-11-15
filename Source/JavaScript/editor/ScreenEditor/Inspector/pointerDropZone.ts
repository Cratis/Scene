// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DropZone } from '../Structure/DropZone';

// Which part of a row a pointer is over: the top quarter, the bottom quarter, or the middle.
export function pointerDropZone(offsetY: number, rowHeight: number, acceptsChildren: boolean): DropZone {
    if (rowHeight <= 0) return DropZone.After;
    const ratio = offsetY / rowHeight;
    if (ratio < 0.25) return DropZone.Before;
    if (ratio > 0.75 || !acceptsChildren) return ratio < 0.5 ? DropZone.Before : DropZone.After;
    return DropZone.Inside;
}
