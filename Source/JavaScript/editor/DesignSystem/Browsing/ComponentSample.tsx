// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { CSSProperties } from 'react';
import type { DesignPart } from '../Resolving/designResolution';

export interface ComponentSampleProps {
    /** The parts of the variant in the state, with the values they resolve to in the theme and mode shown. */
    parts: readonly DesignPart[];

    /** What the sample says. */
    label: string;
}

/**
 * A component drawn from its resolved parts alone: text, border, background, radius and height, each in the theme and mode
 * shown. Nothing here is a copy of the real component - it is the design system's own declaration, made visible.
 */
export const ComponentSample = ({ parts, label }: ComponentSampleProps) => {
    const resolve = (part: string): string | undefined => {
        const value = parts.find(candidate => candidate.part === part)?.value;
        return value === undefined || value === '' ? undefined : value;
    };
    const border = resolve('border');
    const style: CSSProperties = {
        color: resolve('text'),
        background: resolve('background'),
        border: border === undefined ? '1px solid transparent' : `1px solid ${border}`,
        borderRadius: resolve('radius'),
        height: resolve('height'),
    };
    return <span className='studio-design-system__sample' style={style}>{label}</span>;
};
