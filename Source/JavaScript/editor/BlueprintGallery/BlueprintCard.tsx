// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useId, useState } from 'react';
import { Button } from '@cratis/components/Common';
import { Tag } from '@cratis/components/Display';
import { BlueprintPinStatus } from '@cratis/scene.engine';
import { BlueprintInstallState } from './BlueprintInstallState';
import type { BlueprintGalleryCard } from './BlueprintGalleryCard';
import type { BlueprintGalleryStrings } from './BlueprintGalleryStrings';
import { formatGalleryMessage } from './formatGalleryMessage';
import './BlueprintCard.css';

export interface BlueprintCardProps {
    card: BlueprintGalleryCard;

    /** The thumbnail's URL, when the host has one. */
    thumbnailUrl?: string;
    strings: BlueprintGalleryStrings;

    /** Adds the blueprint to the profile for its templates, or removes it when it is already there. */
    onToggle: (card: BlueprintGalleryCard) => void;

    /** Opens the blueprint as a running application. */
    onPreview: (card: BlueprintGalleryCard) => void;
}

const updateText = (card: BlueprintGalleryCard, strings: BlueprintGalleryStrings): string | undefined => {
    if (!card.update) return undefined;
    const template = {
        [BlueprintPinStatus.UpdateAvailable]: strings.update.available,
        [BlueprintPinStatus.UpdateBlockedByPin]: strings.update.blocked,
        [BlueprintPinStatus.NotSatisfied]: strings.update.notSatisfied,
        [BlueprintPinStatus.Invalid]: strings.update.invalid,
        [BlueprintPinStatus.Current]: '',
    }[card.update.status];
    return formatGalleryMessage(template, { from: card.update.from, to: card.update.to, pin: card.update.pin });
};

/**
 * One blueprint of the gallery: its thumbnail, name and version, what it is, where it stands in the profile and what can be done about it - add it for its
 * templates, preview it as an application - with "what you get" (screens, templates, sample data, requirements) one disclosure away.
 * Every control is a button with a name that says which blueprint it acts on, so a screen reader hears the same thing a sighted author sees.
 */
export function BlueprintCard({ card, thumbnailUrl, strings, onToggle, onPreview }: BlueprintCardProps) {
    const [open, setOpen] = useState(false);
    const titleId = useId();
    const detailsId = useId();
    const labels = strings.actions;
    const isShell = card.state === BlueprintInstallState.Shell;
    const isRequired = card.state === BlueprintInstallState.Required;
    const isAdded = card.state === BlueprintInstallState.TemplatePack;
    const update = updateText(card, strings);
    const named = (label: string) => formatGalleryMessage(label, { name: card.name });
    const stateLabel = strings.state[card.state];

    return (
        <li className='studio-blueprint-card' data-blueprint={card.package} data-state={card.state} aria-labelledby={titleId}>
            <div className='studio-blueprint-card__thumbnail'>
                {thumbnailUrl
                    ? <img src={thumbnailUrl} alt={formatGalleryMessage(strings.thumbnailAlt, { name: card.name })} loading='lazy' />
                    : <span className='studio-blueprint-card__no-thumbnail'>{strings.noThumbnail}</span>}
            </div>
            <div className='studio-blueprint-card__body'>
                <header className='studio-blueprint-card__header'>
                    <h3 id={titleId} className='studio-blueprint-card__title'>{card.name}</h3>
                    <span className='studio-blueprint-card__version'>{formatGalleryMessage(strings.version, { version: card.version })}</span>
                </header>
                <p className='studio-blueprint-card__description'>{card.description}</p>
                <p className='studio-blueprint-card__facts'>
                    <span>{formatGalleryMessage(strings.screens, { count: card.screens.length })}</span>
                    <span>{formatGalleryMessage(strings.templates, { count: card.templateCount })}</span>
                    <span>{card.domain}</span>
                </p>
                <div className='studio-blueprint-card__status' role='status'>
                    {card.state !== BlueprintInstallState.Available && <Tag value={stateLabel} severity='success' />}
                    {update && <Tag value={update} severity={card.update!.status === BlueprintPinStatus.UpdateAvailable ? 'info' : 'warn'} />}
                </div>
                <div className='studio-blueprint-card__actions'>
                    <Button label={isAdded ? labels.remove : labels.add} size='small' variant={isAdded ? 'outline' : 'solid'} aria-label={named(isAdded ? labels.removeNamed : labels.addNamed)}
                        disabled={isShell || isRequired} title={isShell ? labels.shellCannotBeRemoved : isRequired ? labels.requiredCannotBeRemoved : undefined} onClick={() => onToggle(card)} />
                    <Button label={labels.preview} size='small' variant='outline' aria-label={named(labels.previewNamed)} onClick={() => onPreview(card)} />
                    <Button label={open ? labels.hideDetails : labels.details} size='small' variant='ghost' aria-expanded={open} aria-controls={detailsId} onClick={() => setOpen(!open)} />
                </div>
                {open && (
                    <div id={detailsId} className='studio-blueprint-card__details'>
                        <h4>{strings.whatYouGet}</h4>
                        <ul className='studio-blueprint-card__screens'>
                            {card.screens.map(screen => <li key={screen.name} title={screen.description}>{screen.title}</li>)}
                        </ul>
                        <ul className='studio-blueprint-card__templates'>
                            {card.templateGroups.map(group => (
                                <li key={group.category}>
                                    <strong>{group.category || strings.uncategorized}</strong>
                                    <span>{group.templates.join(', ')}</span>
                                </li>
                            ))}
                        </ul>
                        {card.sampleData.length > 0 && (
                            <>
                                <h4>{strings.sampleData}</h4>
                                <ul className='studio-blueprint-card__packs'>
                                    {card.sampleData.map(pack => <li key={pack.id}>{pack.title} <span>({pack.locale})</span>{pack.default && <Tag value={strings.defaultPack} severity='secondary' />}</li>)}
                                </ul>
                            </>
                        )}
                        {card.dependencies.length > 0 && <p>{formatGalleryMessage(strings.requires, { names: card.dependencies.map(dependency => dependency.name).join(', ') })}</p>}
                        {card.update && <p className='studio-blueprint-card__update-message'>{card.update.message}</p>}
                    </div>
                )}
            </div>
        </li>
    );
}
