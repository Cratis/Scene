// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { ScreenThumbnail, withScreenAsPrimary, type ScreenEditorRuntime } from '@cratis/scene.editor';
import type { DesignRouting } from '../Host/DesignCanvasHost';
import { designStringsOf } from '../Host/defaultDesignStrings';
import type { DesignCanvasStrings } from '../Host/DesignCanvasHost';
import { countScreens, filterOverview, kindsOf, overviewScreenKey, type OverviewSubject } from './screensOverview';
import './ScreensOverview.css';

export interface ScreensOverviewProps {
    /** The screens of every subject, supplied by the host: the canvas knows one subject at a time, the overview is product-wide. */
    subjects: readonly OverviewSubject[];
    /** What draws the screens. */
    runtime: ScreenEditorRuntime;
    /** Where a screen links back to; without it the screens are not links. */
    routing?: DesignRouting;
    strings?: DesignCanvasStrings;
    /** The width each screen is drawn at. */
    thumbnailWidth?: number;
    className?: string;
}

/**
 * Every screen designed across a product - in stories, in issues - read-only, each linking back to the subject it was designed in. It is the
 * "Screens" tab of a product-wide page; nothing here edits, so it takes the screens as documents the host has already read.
 */
export const ScreensOverview = ({ subjects, runtime, routing, strings, thumbnailWidth = 260, className }: ScreensOverviewProps) => {
    const words = useMemo(() => designStringsOf(strings), [strings]);
    const [text, setText] = useState('');
    const [kind, setKind] = useState<string>('');
    const shown = useMemo(() => filterOverview(subjects, { text, ...(kind === '' ? {} : { kind: kind as never }) }), [subjects, text, kind]);
    const kinds = useMemo(() => kindsOf(subjects), [subjects]);

    return (
        <section className={`screens-overview ${className ?? ''}`} aria-label={words.screens}>
            <header className='screens-overview__bar'>
                <strong>{words.screens} <span className='screens-overview__count'>{countScreens(shown)}</span></strong>
                <input type='search' value={text} placeholder='Filter screens' aria-label='Filter screens' onChange={event => setText(event.target.value)} />
                {kinds.length > 1 && (
                    <select value={kind} aria-label='Kind' onChange={event => setKind(event.target.value)}>
                        <option value=''>All</option>
                        {kinds.map(candidate => <option key={candidate} value={candidate}>{candidate}</option>)}
                    </select>
                )}
            </header>
            {shown.length === 0 && <p className='screens-overview__empty'>{words.noScreens}</p>}
            {shown.map(entry => (
                <section key={`${entry.subject.kind}:${entry.subject.id}`} className='screens-overview__subject' aria-label={entry.title}>
                    <h3>{entry.title} <span className='screens-overview__kind'>{entry.subject.kind}</span></h3>
                    <ul className='screens-overview__screens'>
                        {entry.screens.map(screen => (
                            <li key={overviewScreenKey(entry.subject, screen.name)} data-screen={screen.name}>
                                <ScreenThumbnail document={withScreenAsPrimary(screen.document, screen.name)} runtime={runtime} width={thumbnailWidth} title={screen.name} />
                                <p className='screens-overview__name'>
                                    {routing?.openSubject === undefined
                                        ? <span>{screen.name}</span>
                                        : <button type='button' className='screens-overview__link' onClick={() => routing.openSubject!(entry.subject, screen.name)}>{words.openInSubject} {screen.name}</button>}
                                    {screen.caption !== undefined && <span className='screens-overview__caption'>{screen.caption}</span>}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </section>
    );
};
