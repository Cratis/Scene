// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { formatMessage } from '../../UiProfile/formatMessage';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

export interface StatusBarProps {
    strings: UiProfileDesignerStrings;

    /** What the last edit said besides what it did ("Menu mode set to Slim by Minimal"); stays until the next. */
    note?: string;

    /** What the pointer is over, so the bar says what a click would edit. */
    hoveredRegion?: string;

    size: { width: number; height: number };
    touch: boolean;

    /** The width class of the preview (`compact` or `regular`), named after the size. */
    widthClass: 'compact' | 'regular';

    /** What Scene says the regime does to the chosen menu mode, when it replaces it. */
    regimeNote?: string;

    problemCount: number;
    problemsOpen: boolean;
    onToggleProblems: () => void;
}

/** The status bar: what just happened, what a click would edit, the size and regime of the preview, and the problems chip that opens the panel. */
export const StatusBar = ({ strings, note, hoveredRegion, size, touch, widthClass, regimeNote, problemCount, problemsOpen, onToggleProblems }: StatusBarProps) => {
    const text = strings.editor.status;
    const message = hoveredRegion !== undefined ? formatMessage(text.editing, { region: hoveredRegion }) : note ?? text.nothingYet;
    return (
        <footer className='studio-status-bar'>
            <span className='studio-status-bar__message' role='status' aria-live='polite'>{message}</span>
            <span className='studio-status-bar__size' title={regimeNote}>
                {formatMessage(text.size, { width: String(size.width), height: String(size.height) })} · {widthClass === 'compact' ? text.compactWidth : text.regularWidth} · {touch ? text.touch : text.pointer}
            </span>
            <button type='button' className='studio-status-bar__problems' aria-expanded={problemsOpen} aria-controls='studio-problems-panel' data-count={problemCount} onClick={onToggleProblems}>
                {problemCount === 0 ? text.noProblems : formatMessage(problemCount === 1 ? text.problem : text.problems, { count: String(problemCount) })}
            </button>
        </footer>
    );
};
