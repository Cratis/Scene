// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from '@cratis/components/Common';
import type { DesignSystem } from '@cratis/scene.model';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemPreviewHost, DesignSystemVersion } from '../DesignSystemHost';
import { fill } from '../fill';
import { Chip } from '../Parts/Chip';
import { EmptyNote, Panel } from '../Parts/Panel';
import { PreviewOnScreens } from '../Previewing/PreviewOnScreens';
import { designChanges, nameChanges, type DesignDifference } from '../Resolving/designChanges';

export interface DraftChangesProps {
    /** The mode the editor is shown in. */
    mode: string;

    /** The active version, or undefined when there is none yet. */
    active?: DesignSystemVersion;

    /** The draft. */
    draft: DesignSystemVersion;

    /** The active version's design system - undefined when there is none. */
    before?: DesignSystem;

    /** The draft's design system. */
    after: DesignSystem;

    /** Who wrote the draft. */
    authors: readonly string[];

    /** Whether the person looking may activate it. */
    mayActivate: boolean;

    /** Who put the draft up for review, when it is waiting for one. */
    waitingFor?: string;

    /** Whether the host has a review step - without one there is nothing to submit. */
    canSubmit: boolean;

    /** Whether submitting for review is in flight. */
    submitting: boolean;

    /** Whether activation is in flight. */
    activating: boolean;

    /** Whether discarding is in flight. */
    discarding: boolean;

    /** Puts the draft up for review. */
    onSubmit: () => void;

    /** Activates the draft. */
    onActivate: () => void;

    /** Discards the draft. */
    onDiscard: () => void;

    /** Drawing the draft on screens; absent when the host cannot. */
    preview?: DesignSystemPreviewHost;

    /** The words to use. */
    strings: DesignSystemEditorStrings;
}

const tones = { added: 'positive', removed: 'critical', changed: 'info' } as const;
const summary = (change: DesignDifference) => change.kind === 'added' ? change.after : change.kind === 'removed' ? change.before : `${change.before} → ${change.after}`;

/**
 * What the draft changes against the active design system - tokens, themes, components, words and the Screenplay's layouts and
 * templates - who wrote it, and the ways forward: put up for review, activated by someone who did not write it, or discarded.
 */
export const DraftChanges = ({
    mode, active, draft, before, after, authors, mayActivate, waitingFor, canSubmit, submitting, activating, discarding, onSubmit, onActivate, onDiscard, preview, strings,
}: DraftChangesProps) => {
    const words = strings.changes;
    const tokens = designChanges(before, after);
    const names = (read: (outline: DesignSystemVersion['outline']) => readonly string[]) => nameChanges(active === undefined ? [] : read(active.outline), read(draft.outline));
    const layouts = names(outline => outline.layouts);
    const templates = names(outline => outline.screenTemplates);
    const structure = [
        ...layouts.added.map(name => ({ kind: 'added' as const, name: fill(words.layout, { name }) })),
        ...layouts.removed.map(name => ({ kind: 'removed' as const, name: fill(words.layout, { name }) })),
        ...templates.added.map(name => ({ kind: 'added' as const, name: fill(words.screenTemplate, { name }) })),
        ...templates.removed.map(name => ({ kind: 'removed' as const, name: fill(words.screenTemplate, { name }) })),
    ];
    const nothing = tokens.length === 0 && structure.length === 0;
    const against = active === undefined ? words.againstNothing : fill(words.againstActive, { version: active.number });

    return (
        <div className='studio-design-system__stack'>
            <Panel
                title={fill(words.title, { version: draft.number })}
                description={fill(words.description, { against, authors: authors.join(', ') || words.nobody })}>
                {nothing && <EmptyNote title={words.emptyTitle} description={words.emptyDescription} />}
                <ul className='studio-design-system__rows'>
                    {structure.map(change => (
                        <li key={`${change.kind}:${change.name}`} className='studio-design-system__row'>
                            <Chip tone={tones[change.kind]}>{words[change.kind]}</Chip>
                            <span className='studio-design-system__name'>{change.name}</span>
                        </li>
                    ))}
                    {tokens.map(change => (
                        <li key={change.path} className='studio-design-system__row'>
                            <Chip tone={tones[change.kind]}>{words[change.kind]}</Chip>
                            <span className='studio-design-system__row-main studio-design-system__name'>{change.path}</span>
                            <span className='studio-design-system__raw-value'>{summary(change)}</span>
                        </li>
                    ))}
                </ul>
            </Panel>
            {preview !== undefined && <PreviewOnScreens host={preview} mode={mode === 'dark' ? 'dark' : 'light'} strings={strings} />}
            <Panel title={words.reviewTitle} description={words.reviewDescription}>
                <div className='studio-design-system__actions'>
                    {waitingFor !== undefined
                        ? <Chip tone='info'>{fill(words.waitingFor, { person: waitingFor })}</Chip>
                        : canSubmit && <Button variant='outline' label={words.submit} icon='pi pi-send' disabled={nothing || submitting} onClick={onSubmit} />}
                    <Button label={fill(words.activate, { version: draft.number })} icon='pi pi-check' disabled={!mayActivate || nothing || activating} onClick={onActivate} />
                    <Button variant='outline' tone='critical' label={words.discard} icon='pi pi-trash' disabled={discarding} onClick={onDiscard} />
                    {!mayActivate && <span className='studio-design-system__note'>{words.youWroteIt}</span>}
                </div>
            </Panel>
        </div>
    );
};
