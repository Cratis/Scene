// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from '@cratis/components/Common';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemState } from '../DesignSystemHost';
import { fill } from '../fill';
import { Chip } from '../Parts/Chip';
import { Segmented } from '../Parts/Segmented';
import type { ShownVersion } from './designSystemView';

export interface DesignSystemBannerProps {
    /** The design system. */
    state: DesignSystemState;

    /** The version shown. */
    shown: ShownVersion;

    /** The modes the design system declares. */
    modes: readonly string[];

    /** The mode shown. */
    mode: string;

    /** The themes that implement the design system. */
    themes: readonly string[];

    /** The theme shown. */
    theme: string;

    /** Who put the draft up for review, when it is waiting for one. */
    waitingFor?: string;

    /** Whether starting a draft is in flight. */
    starting: boolean;

    /** Shows the active version or the draft. */
    onShowVersion: (version: ShownVersion) => void;

    /** Shows a mode. */
    onShowMode: (mode: string) => void;

    /** Shows a theme. */
    onShowTheme: (theme: string) => void;

    /** Starts a draft. */
    onStartDraft: () => void;

    /** Opens the draft - shows it and goes to its changes. */
    onOpenDraft: () => void;

    /** The words to use. */
    strings: DesignSystemEditorStrings;
}

const capitalize = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/**
 * The golden standard at the top of the editor: which version is active, whether a draft is open, and the switches for what
 * is shown - the active version or the draft, the theme and the mode.
 */
export const DesignSystemBanner = ({ state, shown, modes, mode, themes, theme, waitingFor, starting, onShowVersion, onShowMode, onShowTheme, onStartDraft, onOpenDraft, strings }: DesignSystemBannerProps) => {
    const words = strings.banner;
    const { active, draft } = state;
    return (
        <div className='studio-design-system__banner'>
            <div className='studio-design-system__chips'>
                {active !== undefined
                    ? <Chip tone='positive'>{fill(words.goldenStandard, { version: active.number })}</Chip>
                    : <Chip tone='caution'>{words.none}</Chip>}
                {draft !== undefined && <Chip tone='info'>{fill(draft.authoredBy === undefined || draft.authoredBy === '' ? words.draftVersion : words.draft, { version: draft.number, author: draft.authoredBy ?? '' })}</Chip>}
                {draft !== undefined && waitingFor !== undefined && <Chip tone='caution'>{fill(words.waitingForReview, { person: waitingFor })}</Chip>}
            </div>
            <div className='studio-design-system__chips'>
                {draft !== undefined && active !== undefined && (
                    <Segmented
                        label={words.versionShown}
                        value={shown}
                        onChange={value => onShowVersion(value === 'draft' ? 'draft' : 'active')}
                        options={[
                            { value: 'active', label: fill(words.active, { version: active.number }) },
                            { value: 'draft', label: fill(words.draftVersion, { version: draft.number }) },
                        ]} />
                )}
                {themes.length > 1 && <Segmented label={words.theme} value={theme} onChange={onShowTheme} options={themes.map(name => ({ value: name, label: name }))} />}
                {modes.length > 1 && <Segmented label={words.mode} value={mode} onChange={onShowMode} options={modes.map(name => ({ value: name, label: capitalize(name) }))} />}
                {draft !== undefined && <Button label={words.openDraft} icon='pi pi-folder-open' onClick={onOpenDraft} />}
                {draft === undefined && <Button label={active !== undefined ? words.startDraft : words.startFromStarter} icon='pi pi-pencil' disabled={starting} onClick={onStartDraft} />}
            </div>
        </div>
    );
};
