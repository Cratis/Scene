// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { CSSProperties } from 'react';
import type { DialogFrameDescription } from '../Templates/dialogPresentation';

// What marks the element that is the backdrop of a popup (see DialogFrame.css): which popup it is, and the heading it carries. Nothing for a page.
export function dialogFrameAttributes(frame: DialogFrameDescription | undefined): { 'data-studio-dialog'?: string; style: CSSProperties } {
    if (!frame) return { style: {} };
    return {
        'data-studio-dialog': frame.presentation,
        style: frame.title ? { ['--studio-dialog-title' as string]: JSON.stringify(frame.title) } : {},
    };
}
