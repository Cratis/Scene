// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentType } from 'react';
import { IconReference } from '@cratis/scene.model';

/**
 * What an icon library's glyph is handed to draw itself. The glyph owns only its artwork: `SceneIcon`
 * has already sized and colored the box it sits in and made it accessible, so a glyph just fills it.
 */
export interface IconGlyphProps {
    /**
     * The width and height to draw at - a number of pixels or any CSS length.
     */
    size: number | string;

    /**
     * The color to draw in; `currentColor` unless the caller chose one.
     */
    color: string;

    /**
     * An optional class for the artwork element.
     */
    className?: string;
}

/**
 * One icon's artwork, as a component.
 */
export type IconGlyph = ComponentType<IconGlyphProps>;

/**
 * How one icon library's references become pixels in React. The model persists only an
 * {@link IconReference}; an adapter is the library's own answer to "what does this one look like here",
 * so no markup, class name or component is ever persisted - and a library can be re-rendered, or replaced
 * by one with an adapter for another renderer, without touching a single stored value.
 *
 * Artwork is loaded per icon and on demand, so a library with thousands of icons costs a screen only the
 * ones it shows.
 */
export interface IconAdapter {
    /**
     * The library this adapter renders - an {@link IconReference.library}.
     */
    library: string;

    /**
     * Loads the artwork for one reference. Resolves to `undefined` when the library has no such icon.
     */
    loadGlyph(reference: IconReference): Promise<IconGlyph | undefined> | IconGlyph | undefined;
}
