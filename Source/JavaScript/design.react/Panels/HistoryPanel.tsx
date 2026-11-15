// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSession } from '@cratis/scene.design';
import type { DesignStringKey } from '../Host/DesignCanvasHost';
import { historyOf } from '../State/revisionHistory';
import './Panels.css';

export interface HistoryPanelProps {
    session: DesignSession;
    screen: string;
    strings: Record<DesignStringKey, string>;
    onRevert(revisionId: string): void;
    onRevertTurn(turnId: string): void;
}

/**
 * The revisions of one screen, newest first. Going back to one is a new revision - nothing is deleted - and a turn that changed several screens can
 * be undone in one action from any of them.
 */
export const HistoryPanel = ({ session, screen, strings, onRevert, onRevertTurn }: HistoryPanelProps) => {
    const entries = historyOf(session, screen);
    if (entries.length === 0) return <p className='design-panel__empty'>{strings.noHistory}</p>;
    return (
        <ol className='design-history' aria-label={`${strings.history}: ${screen}`}>
            {entries.map(entry => (
                <li key={entry.revision.id} className={`design-history__entry${entry.current ? ' design-history__entry--current' : ''}`} data-revision={entry.revision.id} data-kind={entry.kind}>
                    <p className='design-history__summary'>{entry.summary}</p>
                    <p className='design-history__meta'>
                        {entry.revision.author}
                        {entry.alsoChanged.length > 0 && <span> · also changed {entry.alsoChanged.join(', ')}</span>}
                    </p>
                    {!entry.current && (
                        <button type='button' className='design-history__revert' onClick={() => onRevert(entry.revision.id)}>{strings.revert}</button>
                    )}
                    {entry.current && entry.revision.turnId !== undefined && entry.alsoChanged.length > 0 && (
                        <button type='button' className='design-history__revert' onClick={() => onRevertTurn(entry.revision.turnId!)}>{strings.undoTurn}</button>
                    )}
                </li>
            ))}
        </ol>
    );
};
