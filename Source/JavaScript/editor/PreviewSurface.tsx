// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef } from 'react';
import { BindingResolver } from '@cratis/scene.engine';
import { SceneElement } from '@cratis/scene.model';
import { ComponentRegistry, SceneElementView } from '@cratis/scene.react';
import './PreviewSurface.css';

export interface PreviewSurfaceProps {
    element: SceneElement;
    registry: ComponentRegistry;
    resolveBinding: BindingResolver;

    /**
     * Called with the `data-scene-id` of the element under the pointer whenever the surface is clicked -
     * `undefined` when the click landed outside any rendered scene element. Hit-testing walks up from the
     * click target to the nearest `data-scene-id` ancestor; it does not require `SceneElementView` itself to
     * know an editor exists.
     */
    onElementClick?: (sceneElementId: string | undefined) => void;
}

/**
 * The WYSIWYG preview surface - renders a scene element tree through the real `SceneElementView` from
 * `@cratis/scene.react`, unmodified. This is the guarantee behind StudioIssues#156: Studio is not
 * approximating what Stage runs, it is running the identical renderer in design mode. Editing affordances
 * (selection, hover, drop targets) are a separate overlay layered on top - see `SelectionOverlay` - never a
 * change to this component or to `@cratis/scene.react`.
 */
export function PreviewSurface({ element, registry, resolveBinding, onElementClick }: PreviewSurfaceProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!onElementClick) {
            return;
        }

        const target = (event.target as HTMLElement).closest('[data-scene-id]');
        onElementClick(target?.getAttribute('data-scene-id') ?? undefined);
    };

    return (
        <div ref={containerRef} className="studio-editor-preview-surface" onClick={handleClick}>
            <SceneElementView element={element} registry={registry} resolveBinding={resolveBinding} />
        </div>
    );
}
