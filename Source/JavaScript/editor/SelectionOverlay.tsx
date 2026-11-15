// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RefObject } from 'react';
import { ElementRect, useElementRect } from './useElementRect';
import './SelectionOverlay.css';

export interface SelectionOverlayProps {
    /** The container `PreviewSurface` rendered into - overlay rects are positioned relative to it. */
    containerRef: RefObject<HTMLElement | null>;
    selectedId?: string;
    hoveredId?: string;
}

/**
 * Design-mode selection/hover chrome, drawn as an absolutely-positioned overlay above an unmodified
 * `PreviewSurface` - resolves StudioIssues#156's open question in favor of "injected by the editing chrome"
 * rather than a design-mode flag on `SceneElementView`/`@cratis/scene.react`. It locates elements purely
 * through the `data-scene-id` attribute `createReactRenderer` already emits, so it needs no cooperation from
 * the renderer beyond that attribute.
 */
export function SelectionOverlay({ containerRef, selectedId, hoveredId }: SelectionOverlayProps) {
    const selectedRect = useElementRect(containerRef, selectedId);
    const hoveredRect = useElementRect(containerRef, hoveredId !== selectedId ? hoveredId : undefined);

    return (
        <div className="studio-editor-selection-overlay">
            {hoveredRect && <div className="studio-editor-selection-overlay__hover" style={rectToStyle(hoveredRect)} />}
            {selectedRect && <div className="studio-editor-selection-overlay__selection" style={rectToStyle(selectedRect)} />}
        </div>
    );
}

function rectToStyle(rect: ElementRect): React.CSSProperties {
    return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
    };
}
