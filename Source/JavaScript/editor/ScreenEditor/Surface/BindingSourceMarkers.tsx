// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useLayoutEffect, useState, type RefObject } from 'react';
import { elementRect, surfaceOrigin } from './elementRect';
import { sameSelection } from './sameMeasurement';
import type { Rect } from './dropRegionRects';

export interface BindingSourceMarker {
    // The component the selected element reads from.
    componentId: string;

    // What reads it, said in the author's terms - "customer ← Customer - Value".
    label: string;
}

export interface BindingSourceMarkersProps {
    surface: RefObject<HTMLDivElement | null>;
    markers: readonly BindingSourceMarker[];
}

interface PlacedMarker extends BindingSourceMarker {
    rect: Rect;
}

// Outlines, on the screen itself, each component the selected element takes a value from, labelled with what it feeds. The
// binding is the author's to see where it acts, not only as a path in the inspector.
export const BindingSourceMarkers = ({ surface, markers }: BindingSourceMarkersProps) => {
    const [placed, setPlaced] = useState<PlacedMarker[]>([]);

    useLayoutEffect(() => {
        const root = surface.current;
        if (!root) return;
        const origin = surfaceOrigin(root);
        const next = markers.flatMap(marker => {
            const rect = elementRect(root, marker.componentId, origin);
            return rect ? [{ ...marker, rect }] : [];
        });
        setPlaced(previous => samePlacement(previous, next) ? previous : next);
    });

    return (
        <>
            {placed.map(marker => (
                <div key={`${marker.componentId}:${marker.label}`} className='studio-screen-surface__binding-source' data-binding-source={marker.componentId} style={marker.rect}>
                    <span className='studio-screen-surface__binding-label'>{marker.label}</span>
                </div>
            ))}
        </>
    );
};

function samePlacement(first: readonly PlacedMarker[], second: readonly PlacedMarker[]): boolean {
    return first.length === second.length && first.every((marker, index) => {
        const other = second[index]!;
        return marker.componentId === other.componentId && marker.label === other.label && sameSelection(marker.rect, other.rect);
    });
}
