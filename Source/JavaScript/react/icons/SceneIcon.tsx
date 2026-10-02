// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { IconReference } from '@cratis/scene.model';
import { IconAdapterRegistry } from './IconAdapterRegistry';
import { useIconAdapters } from './IconAdapterContext';
import { useIconGlyph } from './useIconGlyph';

export interface SceneIconProps {
    /**
     * The icon to draw.
     */
    reference: IconReference;

    /**
     * The adapters to render through. Defaults to the ones an `IconAdapterProvider` supplies.
     */
    adapters?: IconAdapterRegistry;

    /**
     * The width and height of the icon: a number of pixels or any CSS length. Defaults to `1em`, so an
     * icon scales with the text it sits in.
     */
    size?: number | string;

    /**
     * The color to draw in. Defaults to `currentColor`.
     */
    color?: string;

    /**
     * The accessible name. With a label the icon is announced as an image; without one it is decorative
     * and hidden from assistive technology - an icon next to its own text label should not be read twice.
     */
    label?: string;

    /**
     * An optional class for the box the icon sits in.
     */
    className?: string;

    /**
     * What to show when the icon cannot be drawn - no adapter, no such icon, a failed load. Nothing by
     * default; the box keeps its size so layout does not shift.
     */
    fallback?: ReactNode;
}

/**
 * Draws a renderer-neutral {@link IconReference} through the adapter registered for its library, honoring
 * size, color and accessible label. The reference is all that is persisted; this is where it becomes pixels.
 */
export const SceneIcon = ({ reference, adapters, size = '1em', color = 'currentColor', label, className, fallback }: SceneIconProps) => {
    const inScope = useIconAdapters();
    const state = useIconGlyph(reference, adapters ?? inScope);
    const Glyph = state.status === 'ready' ? state.glyph : undefined;

    return (
        <span
            className={className}
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            data-icon-library={reference.library}
            data-icon-key={reference.key}
            data-icon-variant={reference.variant}
            data-icon-state={state.status}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, color, flexShrink: 0 }}>
            {Glyph ? <Glyph size={size} color={color} /> : state.status === 'unavailable' ? fallback : null}
        </span>
    );
};
