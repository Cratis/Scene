// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';

export interface PanelProps {
    /** What the panel is about. */
    title: string;

    /** What it is for. */
    description?: string;

    /** What it holds. */
    children?: ReactNode;
}

/** A titled group of the design system editor: a heading, a sentence about it, and what it holds. */
export const Panel = ({ title, description, children }: PanelProps) => (
    <section className='studio-design-system__panel' aria-label={title}>
        <header className='studio-design-system__panel-header'>
            <h3 className='studio-design-system__panel-title'>{title}</h3>
            {description !== undefined && description !== '' && <p className='studio-design-system__panel-description'>{description}</p>}
        </header>
        {children}
    </section>
);

export interface EmptyNoteProps {
    /** What there is none of. */
    title: string;

    /** What to do about it. */
    description?: string;
}

/** What is said in place of a list that is empty. */
export const EmptyNote = ({ title, description }: EmptyNoteProps) => (
    <div className='studio-design-system__empty' role='note'>
        <strong>{title}</strong>
        {description !== undefined && description !== '' && <span>{description}</span>}
    </div>
);
