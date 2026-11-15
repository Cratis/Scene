// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DropRegionKind } from '../DropRegions/DropRegionKind';
import type { SurfaceStrings } from './DesignTime/SurfaceStrings';
import type { DragFeedback } from './useSurfaceDrop';

// The grip announces the element's name, else its component's name, else nothing.
export const selectedNameOf = (selection: object | undefined): string => {
    if (!selection) return '';
    const { name, componentName } = selection as { name?: string; componentName?: string };
    return name || componentName || '';
};

// Tells a person who cannot see the drop markers where a drag would land; nothing when nothing is dragged.
export const dropAnnouncement = (feedback: DragFeedback | undefined, strings: Pick<SurfaceStrings, 'dropDenied' | 'dropTarget'>): string => {
    if (!feedback) return '';
    if (feedback.denied || !feedback.drop) return strings.dropDenied;
    return strings.dropTarget(feedback.drop.target.region.kind === DropRegionKind.Container ? 'into' : 'between');
};
