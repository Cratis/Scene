// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PreviewProblem } from './PreviewProblem';

export interface PreviewProblemsViewProps {
    problems: PreviewProblem[];

    /** Called when the author follows a problem to the node it is about. */
    onSelectProblem?(problem: PreviewProblem): void;
}

/**
 * What a preview shows instead of a blank screen when the model has errors that would break rendering (PRV8): each problem
 * with its code, its message and a link to the offending node.
 */
export function PreviewProblemsView({ problems, onSelectProblem }: PreviewProblemsViewProps) {
    return (
        <section className='scene-preview-problems' role='alert' data-scene-preview-problems>
            <h2>This preview cannot be shown</h2>
            <ul>
                {problems.map((problem, index) => (
                    <li key={`${problem.code}-${problem.nodeId ?? index}-${index}`} data-severity={problem.severity} data-code={problem.code} data-node-id={problem.nodeId}>
                        <code>{problem.code}</code> {problem.message}
                        {problem.nodeId !== undefined && onSelectProblem && <> <button type='button' onClick={() => onSelectProblem(problem)}>Show {problem.nodeId}</button></>}
                    </li>
                ))}
            </ul>
        </section>
    );
}
