// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import { fill } from '../fill';
import { Chip } from '../Parts/Chip';
import { InFlightButton } from '../Parts/InFlightButton';
import { EmptyNote, Panel } from '../Parts/Panel';
import type { OffStandardEntry, OffStandardKind } from './offStandardEntries';
import type { OffStandardState } from './useOffStandard';

export interface OffStandardProps {
    /** What is off the standard and the actions on it. */
    standard: OffStandardState;

    /** Whether the design system has an active version - without one there is no standard to be off. */
    hasStandard: boolean;

    /** The words to use. */
    strings: DesignSystemEditorStrings;
}

/**
 * What the designs have outside the design system: each value with the screens that use it, and what to do about it - raise
 * an issue, write the token it stands for into the designs, or propose it to the design system. A way the host does not
 * offer is not drawn.
 */
export const OffStandard = ({ standard, hasStandard, strings }: OffStandardProps) => {
    const words = strings.standard;
    if (!hasStandard) return <EmptyNote title={words.noStandardTitle} description={words.noStandardDescription} />;
    if (!standard.isReady) return <p role='status' className='studio-design-system__note'>{words.loading}</p>;
    if (standard.entries.length === 0) return <EmptyNote title={words.allKeptTitle} description={words.allKeptDescription} />;

    const kinds: Record<OffStandardKind, string> = { color: words.kindColor, token: words.kindToken, component: words.kindComponent };

    const row = (entry: OffStandardEntry) => {
        const where = entry.places.map(place => place.title).join(', ');
        return (
            <li key={`${entry.kind}:${entry.value}`} className='studio-design-system__card'>
                <span className='studio-design-system__chips'>
                    <Chip tone='caution'>{kinds[entry.kind]}</Chip>
                    <code className='studio-design-system__name'>{entry.value}</code>
                    <span className='studio-design-system__note'>{fill(entry.total === 1 ? words.usedOnceIn : words.usedIn, { count: entry.total, where })}</span>
                    {entry.suggestion !== '' && <span className='studio-design-system__note'>{fill(words.theSystemHas, { suggestion: entry.suggestion })}</span>}
                </span>
                <span className='studio-design-system__chips'>
                    {standard.canRaiseIssue && <InFlightButton label={words.fixInAnIssue} onRun={() => standard.raiseIssue([entry])} />}
                    {standard.canUseToken && <InFlightButton label={words.useToken} disabled={entry.suggestion === '' || entry.kind === 'component'} onRun={() => standard.useToken(entry)} />}
                    {standard.canPropose && <InFlightButton label={words.proposeToSystem} onRun={() => standard.propose(entry)} />}
                </span>
            </li>
        );
    };

    return (
        <Panel title={words.title} description={words.description}>
            <div className='studio-design-system__stack'>
                {standard.canRaiseIssue && (
                    <div><InFlightButton variant='solid' label={fill(words.fixAll, { count: standard.entries.length })} onRun={() => standard.raiseIssue(standard.entries)} /></div>
                )}
                <ul aria-label={words.list} className='studio-design-system__cards'>{standard.entries.map(row)}</ul>
            </div>
        </Panel>
    );
};
