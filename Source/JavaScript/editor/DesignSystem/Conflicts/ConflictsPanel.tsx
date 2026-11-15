// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemConflictsHost } from '../DesignSystemHost';
import { fill } from '../fill';
import { Chip } from '../Parts/Chip';
import { InFlightButton } from '../Parts/InFlightButton';
import { Panel } from '../Parts/Panel';
import type { DesignSystemConflictEntry } from './DesignSystemConflict';
import { isDecided, kindLabel, placesToChange, undecidedCount, usageOf } from './conflicts';

export interface ConflictsPanelProps {
    /** The conflicts found in the open draft. */
    conflicts: readonly DesignSystemConflictEntry[];

    /** What decides them. */
    host: DesignSystemConflictsHost;

    /** Reads the design system again - a decision can change the draft's tokens. */
    reload: () => Promise<void>;

    /** The words to use. */
    strings: DesignSystemEditorStrings;
}

/**
 * The conflicts found in what the design system was established from - two nearly identical greys, 6px against 8px corners -
 * each with how often and where every value is used. A person keeps one value; the draft follows, and an issue can name the
 * code that should change.
 */
export const ConflictsPanel = ({ conflicts, host, reload, strings }: ConflictsPanelProps) => {
    const words = strings.conflicts;
    if (conflicts.length === 0) return null;

    const waiting = undecidedCount(conflicts);
    const description = waiting === 0 ? words.allDecided : fill(waiting === 1 ? words.waitingOne : words.waitingMany, { count: waiting });

    const decide = async (entry: DesignSystemConflictEntry, chosen: string) => {
        const refusal = await host.decide(entry, chosen);
        if (refusal === undefined) await reload();
        return refusal;
    };

    const raiseIssue = async (entry: DesignSystemConflictEntry) => {
        const refusal = await host.raiseIssue?.(entry);
        if (refusal === undefined) await reload();
        return refusal;
    };

    return (
        <Panel title={words.title} description={description}>
            <ul aria-label={words.title} className='studio-design-system__cards'>
                {conflicts.map(entry => (
                    <li key={entry.conflict.id} className='studio-design-system__card'>
                        <span className='studio-design-system__chips'>
                            <Chip tone='caution'>{kindLabel(entry.conflict.kind, words)}</Chip>
                            <span className='studio-design-system__grow'>{entry.conflict.title}</span>
                            {isDecided(entry) && <span className='studio-design-system__note'>{fill(words.decidedBy, { person: entry.decidedBy })}</span>}
                        </span>
                        <ul className='studio-design-system__options'>
                            {entry.conflict.options.map(option => (
                                <li key={option.value} className='studio-design-system__option'>
                                    <code className='studio-design-system__name'>{option.value}</code>
                                    <span className='studio-design-system__note studio-design-system__grow'>{usageOf(option, words)}</span>
                                    {entry.chosen === option.value
                                        ? <Chip tone='positive'>{words.kept}</Chip>
                                        : <InFlightButton label={fill(words.keep, { value: option.value })} onRun={() => decide(entry, option.value)} />}
                                </li>
                            ))}
                        </ul>
                        {isDecided(entry) && placesToChange(entry) > 0 && host.raiseIssue !== undefined && (
                            <span className='studio-design-system__chips'>
                                {entry.issueRaised
                                    ? <Chip tone='info'>{words.issueRaised}</Chip>
                                    : <InFlightButton label={fill(words.raiseIssue, { count: placesToChange(entry) })} onRun={() => raiseIssue(entry)} />}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </Panel>
    );
};
