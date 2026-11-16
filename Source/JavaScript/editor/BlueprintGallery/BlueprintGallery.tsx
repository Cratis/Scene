// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { Button } from '@cratis/components/Common';
import { Message } from '@cratis/components/Display';
import { Dialog, DialogInitialFocus } from '@cratis/components/Dialogs';
import type { ScenePackageBundle } from '@cratis/scene.react';
import type { UiProfileSettings } from '../UiProfile/UiProfileSettings';
import { BlueprintCard } from './BlueprintCard';
import type { BlueprintGalleryAssets } from './BlueprintGalleryAssets';
import type { BlueprintGalleryCard } from './BlueprintGalleryCard';
import type { BlueprintGalleryStrings } from './BlueprintGalleryStrings';
import { BlueprintPreview } from './BlueprintPreview';
import type { BlueprintReferenceUse } from './BlueprintReferenceUse';
import { blueprintApplications } from './blueprintApplications';
import { describeBlueprintGallery } from './describeBlueprintGallery';
import { formatGalleryMessage } from './formatGalleryMessage';
import './BlueprintGallery.css';

const nothingRequired: ReadonlySet<string> = new Set();
const noReferences: readonly BlueprintReferenceUse[] = [];

export interface BlueprintGalleryProps {
    /** Whether the gallery is open. */
    visible: boolean;

    /** Every bundle this build has loaded; the gallery lists the domain blueprints among them. */
    bundles: ScenePackageBundle[];

    /** The draft UI profile: its shell and template packs say which blueprints are added. */
    profile: Pick<UiProfileSettings, 'shell' | 'templatePacks'>;

    /** The packages the profile has only because another requires them. */
    requiredBy?: ReadonlySet<string>;

    /** The application's template references that pin a blueprint, for "update available". */
    references?: readonly BlueprintReferenceUse[];

    /** The thumbnails and sample data the host loads from the blueprint packages. */
    assets: BlueprintGalleryAssets;
    strings: BlueprintGalleryStrings;

    /** Adds the blueprint to the draft profile for its templates, or removes it when it is there. The profile is a draft until it is applied. */
    onToggleTemplates: (blueprint: string) => void;

    /** Closes the gallery. */
    onClose: () => void;
}

/**
 * The blueprint gallery (spec 6): the domain blueprints Studio ships as cards with a thumbnail, a description and what you get, a way to add one to the UI
 * profile - a draft until the profile is applied - and a way to run one as the application it is, with its own sample data, before choosing it.
 *
 * It is a dialog: focus moves in on open, stays inside, returns to the control that opened it, and Escape closes it - or, while a blueprint is being
 * previewed, leaves the preview first. The cards are a list a screen reader can walk, and each button names the blueprint it acts on.
 */
export function BlueprintGallery({ visible, bundles, profile, requiredBy = nothingRequired, references = noReferences, assets, strings, onToggleTemplates, onClose }: BlueprintGalleryProps) {
    const [filter, setFilter] = useState('');
    const [previewing, setPreviewing] = useState<string | undefined>();
    const cards = useMemo(() => describeBlueprintGallery(bundles, profile, requiredBy, references, filter), [bundles, profile, requiredBy, references, filter]);
    const all = useMemo(() => describeBlueprintGallery(bundles, profile, requiredBy, references), [bundles, profile, requiredBy, references]);
    const previewable = (card: BlueprintGalleryCard) => blueprintApplications[card.package] !== undefined;
    const preview = previewing === undefined ? undefined : all.find(card => card.package === previewing);
    const name = preview?.name ?? '';

    const close = () => {
        setPreviewing(undefined);
        setFilter('');
        onClose();
    };

    return (
        <Dialog
            title={preview ? formatGalleryMessage(strings.preview.title, { name }) : strings.title}
            subtitle={preview ? undefined : strings.intro}
            visible={visible}
            width='min(72rem, 100vw)'
            dismissable
            initialFocus={DialogInitialFocus.Content}
            closeAriaLabel={strings.actions.close}
            className='studio-blueprint-gallery'
            onClose={preview ? () => setPreviewing(undefined) : close}
            buttons={preview
                ? <Button label={strings.preview.back} onClick={() => setPreviewing(undefined)} />
                : <Button label={strings.actions.done} onClick={close} />}>
            {preview ? (
                <BlueprintPreview blueprint={preview.package} bundles={bundles} assets={assets} strings={strings} onExit={() => setPreviewing(undefined)} />
            ) : (
                <div className='studio-blueprint-gallery__content'>
                    <input type='search' className='studio-blueprint-gallery__filter' value={filter} placeholder={strings.filter} aria-label={strings.filter}
                        onChange={event => setFilter(event.target.value)} />
                    {all.length === 0 && <Message severity='warn' text={strings.noBlueprints} />}
                    {all.length > 0 && cards.length === 0 && <p role='status' className='studio-blueprint-gallery__empty'>{strings.nothingMatches}</p>}
                    <ul className='studio-blueprint-gallery__list' aria-label={strings.list}>
                        {cards.map(card => (
                            <BlueprintCard key={card.package} card={card} thumbnailUrl={assets.thumbnailUrl(card.package, card.thumbnail)} strings={strings}
                                onToggle={entry => onToggleTemplates(entry.package)}
                                onPreview={entry => previewable(entry) && setPreviewing(entry.package)} />
                        ))}
                    </ul>
                </div>
            )}
        </Dialog>
    );
}
