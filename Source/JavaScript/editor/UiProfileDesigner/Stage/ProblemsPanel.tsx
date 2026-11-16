// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ProfileSection } from '@cratis/scene.engine';
import { formatMessage } from '../../UiProfile/formatMessage';
import type { PanelProblem } from '../Problems/panelProblems';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

export interface ProblemsPanelProps {
    strings: UiProfileDesignerStrings;
    problems: readonly PanelProblem[];

    /** What the server refused when the last save was attempted, shown with the problems so the draft stays open and the reason is in view. */
    refused?: string;

    onGoTo: (section: ProfileSection) => void;
    onFix: (problem: PanelProblem) => void;
    onClose: () => void;
}

/** The problems panel: every problem Scene found with its severity and its one-click fix, and a way to the section it belongs to. */
export const ProblemsPanel = ({ strings, problems, refused, onGoTo, onFix, onClose }: ProblemsPanelProps) => {
    const text = strings.editor.problems;
    return (
        <section className='studio-problems' id='studio-problems-panel' role='region' aria-label={text.title}>
            <header>
                <h2>{text.title}</h2>
                <button type='button' aria-label={text.close} onClick={onClose}>×</button>
            </header>
            {refused !== undefined && <p className='studio-problems__refused' role='alert'>{formatMessage(text.refused, { message: refused })}</p>}
            {problems.length === 0 && refused === undefined && <p className='studio-problems__none'>{text.none}</p>}
            <ul>
                {problems.map(problem => (
                    <li key={problem.key} data-severity={problem.severity}>
                        <span className='studio-problems__severity'>{text[problem.severity]}</span>
                        <span className='studio-problems__message'>{problem.message}</span>
                        <span className='studio-problems__actions'>
                            <button type='button' onClick={() => onGoTo(problem.section)}>{formatMessage(text.goTo, { section: strings.editor.sections[problem.section] })}</button>
                            {problem.fix !== undefined && <button type='button' data-fix={problem.fix.kind} onClick={() => onFix(problem)}>{problem.fix.label}</button>}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
};
