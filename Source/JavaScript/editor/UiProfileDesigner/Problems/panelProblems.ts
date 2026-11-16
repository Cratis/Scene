// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProblemSeverity, ProfileSection, type ProfileBlocker, type ProfileFix } from '@cratis/scene.engine';
import { ProfileNodeKind } from '../Structure/ProfileNodeKind';
import type { ProfileProblem } from './ProfileProblem';

/** One line of the problems panel, whoever found it: Scene's problems and the ones only Studio can see (a refused save, a dead menu entry). */
export interface PanelProblem {
    /** Tells one problem from another across renders. */
    key: string;

    severity: ProblemSeverity;

    message: string;

    /** The section of the inspector the problem belongs to. */
    section: ProfileSection;

    /** The one-click fix, when Scene has one. */
    fix?: ProfileFix;
}

const sectionOfNode: Record<ProfileNodeKind, ProfileSection> = {
    [ProfileNodeKind.Application]: ProfileSection.App,
    [ProfileNodeKind.Shell]: ProfileSection.Shell,
    [ProfileNodeKind.Theme]: ProfileSection.Look,
    [ProfileNodeKind.Packages]: ProfileSection.Packages,
    [ProfileNodeKind.SampleData]: ProfileSection.SampleData,
};

/** Scene's problems as panel lines. */
export const panelProblemsOfScene = (problems: readonly ProfileBlocker[]): PanelProblem[] =>
    problems.map(problem => ({ key: `scene|${problem.code}|${problem.subject}`, severity: problem.severity, message: problem.message, section: problem.section, ...(problem.fix === undefined ? {} : { fix: problem.fix }) }));

/** Studio's own problems as panel lines: what only the host can see. An error stops the profile; a warning does not. */
export const panelProblemsOfHost = (problems: readonly ProfileProblem[]): PanelProblem[] =>
    problems.map((problem, index) => ({
        key: `host|${problem.code}|${index}`,
        severity: problem.severity === 'error' ? ProblemSeverity.Blocker : ProblemSeverity.Warning,
        message: problem.message,
        section: sectionOfNode[problem.node],
    }));

/**
 * Puts the problems in the order a person fixes them: what stops the profile first, then what is probably unwanted, then what is only worth knowing.
 * Lines that say the same thing are shown once.
 */
export function orderProblems(problems: readonly PanelProblem[]): PanelProblem[] {
    const rank = { [ProblemSeverity.Blocker]: 0, [ProblemSeverity.Warning]: 1, [ProblemSeverity.Info]: 2 };
    const seen = new Set<string>();
    return problems
        .filter(problem => { const id = `${problem.section}|${problem.message}`; if (seen.has(id)) return false; seen.add(id); return true; })
        .map((problem, index) => ({ problem, index }))
        .sort((left, right) => rank[left.problem.severity] - rank[right.problem.severity] || left.index - right.index)
        .map(entry => entry.problem);
}
