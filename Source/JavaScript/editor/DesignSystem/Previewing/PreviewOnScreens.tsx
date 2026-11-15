// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from '@cratis/components/Common';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemPreviewHost } from '../DesignSystemHost';
import { fill } from '../fill';
import { Chip } from '../Parts/Chip';
import { Panel } from '../Parts/Panel';
import type { DesignSystemPreview } from './DesignSystemPreview';
import { pairFor, previewHeadline, screenStatus, type PreviewMode } from './previewing';
import { usePreviewOnScreens } from './usePreviewOnScreens';

export interface PreviewOnScreensProps {
    /** What draws the screens. */
    host: DesignSystemPreviewHost;

    /** The mode the editor is shown in - the preview starts in it. */
    mode: PreviewMode;

    /** The words to use. */
    strings: DesignSystemEditorStrings;

    /** A preview already drawn, so the editor can show one without drawing - what a story passes. */
    initial?: DesignSystemPreview;
}

const tones = { breaks: 'critical', differs: 'info', same: 'neutral' } as const;

/**
 * How the draft looks on the host's screens next to the active design system - the layouts and templates drawn with each,
 * side by side - with how many look different and how many break, so the person reviewing sees what activating would do.
 */
export const PreviewOnScreens = ({ host, mode, strings, initial }: PreviewOnScreensProps) => {
    const words = strings.preview;
    const drawn = usePreviewOnScreens(host);
    const preview = drawn.preview ?? initial;
    const [shown, setShown] = useState<PreviewMode>(mode);
    const labels = { breaks: words.breaks, differs: words.differs, same: words.same };

    return (
        <Panel title={words.title} description={words.description}>
            <div className='studio-design-system__stack'>
                <div className='studio-design-system__actions'>
                    <Button variant='outline' label={preview === undefined ? words.draw : words.drawAgain} icon='pi pi-eye' disabled={!host.available || drawn.drawing} onClick={() => void drawn.draw()} />
                    {preview !== undefined && (['light', 'dark'] as const).map(option => (
                        <Button key={option} variant={shown === option ? 'solid' : 'outline'} label={option === 'dark' ? words.dark : words.light} onClick={() => setShown(option)} />
                    ))}
                    {drawn.drawing && <span role='status' className='studio-design-system__note'>{words.drawing}</span>}
                </div>
                {!host.available && <span role='note' className='studio-design-system__note'>{words.unavailable}</span>}
                {drawn.failed && <span role='alert' className='studio-design-system__error'>{words.failed}</span>}
                {preview !== undefined && <p className='studio-design-system__sentence'>{previewHeadline(preview, words)}</p>}
                {preview !== undefined && (
                    <ul aria-label={words.screens} className='studio-design-system__previews'>
                        {preview.screens.map(screen => {
                            const status = screenStatus(screen);
                            const pair = pairFor(screen, shown);
                            return (
                                <li key={screen.screen} className='studio-design-system__preview'>
                                    <span className='studio-design-system__chips'>
                                        <span className='studio-design-system__name'>{screen.name}</span>
                                        <Chip tone={tones[status]}>{labels[status]}</Chip>
                                    </span>
                                    {screen.problems.length > 0 && <ul className='studio-design-system__problems'>{screen.problems.map(problem => <li key={problem}>{problem}</li>)}</ul>}
                                    <div className='studio-design-system__pair'>
                                        {([[words.active, 'active', pair.active], [words.draft, 'draft', pair.draft]] as const).map(([label, version, image]) => (
                                            <figure key={version} className='studio-design-system__figure'>
                                                {image === undefined
                                                    ? <span className='studio-design-system__note'>{words.notDrawn}</span>
                                                    : <img src={image.image} alt={fill(words.imageAlt, { screen: screen.name, version: label.toLowerCase(), mode: shown })} loading='lazy' />}
                                                <figcaption className='studio-design-system__note'>{label}</figcaption>
                                            </figure>
                                        ))}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </Panel>
    );
};
