// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimePlaceholderTone } from './DesignTimePlaceholderTone';
import './DesignTimePlaceholder.css';

export interface DesignTimePlaceholderProps {
    elementId: string;
    tone: DesignTimePlaceholderTone;
    text: string;
}

// A sized stand-in for a component that has nothing to draw, or failed drawing. It is design-time chrome: the component keeps
// its place on the screen, can be seen and selected, and the rest of the screen stays on the surface.
export const DesignTimePlaceholder = ({ elementId, tone, text }: DesignTimePlaceholderProps) => (
    <div className='studio-design-placeholder' data-studio-placeholder-for={elementId} data-tone={tone} role='note'>{text}</div>
);
