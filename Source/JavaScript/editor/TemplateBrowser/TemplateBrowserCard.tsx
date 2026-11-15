// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { forwardRef } from 'react';
import { Tag } from '@cratis/components/Display';
import { formatTemplateBrowserMessage } from './formatTemplateBrowserMessage';
import type { TemplateBrowserEntry } from './TemplateBrowserEntry';
import type { TemplateBrowserStrings } from './TemplateBrowserStrings';
import type { TemplateBrowserRuntime } from './TemplateBrowserPreview';
import { OwnTemplateThumbnail } from './OwnTemplateThumbnail';
import { TemplateOrigin } from './TemplateOrigin';
import './TemplateBrowserCard.css';

export interface TemplateBrowserCardProps {
    entry: TemplateBrowserEntry;
    selected: boolean;

    /** Whether the card is the one a Tab lands on (roving tab index). */
    focusable: boolean;

    /** The thumbnail's URL, when the host has one. */
    thumbnailUrl?: string;

    /** What an own template is drawn with: the template is drawn small from its saved document, when the host gives the documents. */
    runtime?: TemplateBrowserRuntime;
    strings: TemplateBrowserStrings;
    onSelect: (entry: TemplateBrowserEntry) => void;
    onActivate: (entry: TemplateBrowserEntry) => void;
}

/**
 * One template of the grid: a thumbnail, its name, what it is for, and badges for whose it is and what is the matter with it.
 * It is an option of the grid's listbox, so the grid is one tab stop and the arrows walk it.
 */
export const TemplateBrowserCard = forwardRef<HTMLLIElement, TemplateBrowserCardProps>(function TemplateBrowserCard({ entry, selected, focusable, thumbnailUrl, runtime, strings, onSelect, onActivate }, ref) {
    const own = entry.origin === TemplateOrigin.Own;
    const none = <span className='studio-template-card__no-thumbnail'><i className={`pi ${own ? 'pi-image' : 'pi-th-large'}`} aria-hidden='true' /> {strings.noThumbnail}</span>;
    return (
        <li ref={ref} role='option' aria-selected={selected} tabIndex={focusable ? 0 : -1} className='studio-template-card' data-template={entry.id} data-origin={entry.origin}
            data-selected={selected} data-applies={entry.applicability.applies} onClick={() => onSelect(entry)} onDoubleClick={() => onActivate(entry)}>
            <div className='studio-template-card__thumbnail'>
                {thumbnailUrl
                    ? <img src={thumbnailUrl} alt='' loading='lazy' />
                    : own && runtime !== undefined ? <OwnTemplateThumbnail entry={entry} runtime={runtime} fallback={none} /> : none}
            </div>
            <div className='studio-template-card__body'>
                <h3 className='studio-template-card__title'>{entry.displayName}</h3>
                <p className='studio-template-card__meta'>
                    <span>{strings.kinds[entry.kind]}</span>
                    {entry.category && <span>{entry.category}</span>}
                    {entry.packageName && <span>{entry.packageName}</span>}
                </p>
                {entry.description && <p className='studio-template-card__description'>{entry.description}</p>}
                <div className='studio-template-card__badges'>
                    <Tag value={own ? strings.badges.own : strings.badges.blueprint} severity={own ? 'success' : 'info'} />
                    {entry.current && <Tag value={strings.badges.current} severity='success' />}
                    {!entry.installed && <Tag value={strings.badges.notInProfile} severity='warn' />}
                    {!entry.compatible && <Tag value={strings.badges.incompatible} severity='danger' />}
                    {!entry.applicability.applies && <Tag value={strings.badges.doesNotApply} severity='secondary' />}
                    {entry.update && <Tag value={formatTemplateBrowserMessage(strings.update.available, { from: entry.update.from, to: entry.update.to, pin: entry.update.pin })} severity='info' />}
                </div>
            </div>
        </li>
    );
});
