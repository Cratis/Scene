// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DropRegionKind } from '../DropRegions/DropRegionKind';
import type { DragFeedback } from './useSurfaceDrop';

export interface DropIndicatorProps {
    feedback: DragFeedback;
    deniedText: string;
}

// What the author sees under the pointer for the whole of a drag: the container that would receive the drop outlined, the exact
// insertion point marked inside it, or - where nothing may be dropped - a refusal. It is chrome over the surface; none of it is
// part of the screen.
export const DropIndicator = ({ feedback, deniedText }: DropIndicatorProps) => {
    if (feedback.denied || !feedback.drop) return <div className='studio-screen-surface__denied' data-studio-drop-state='denied'>{deniedText}</div>;

    const { target, container } = feedback.drop;
    return (
        <>
            <div className='studio-screen-surface__drop-container' data-studio-drop-state='container' style={container} />
            <div
                className={`studio-screen-surface__target studio-screen-surface__target--${target.region.kind}`}
                data-studio-drop-state={target.region.kind === DropRegionKind.Container ? 'into' : 'between'}
                data-empty={target.region.isEmptyContainer}
                style={target.rect}
            />
        </>
    );
};
