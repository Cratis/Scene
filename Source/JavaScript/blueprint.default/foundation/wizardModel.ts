// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One step of a wizard. */
export interface WizardStep {
    id: string;
    label: string;
    /** Whether the step's own fields are valid; a step that is not valid blocks Next. Defaults to true. */
    valid: boolean;
}

/** Where a step stands for the person going through the wizard. */
export enum StepStatus {
    Completed = 'completed',
    Current = 'current',
    Upcoming = 'upcoming',
}

/** Reads steps, dropping those without an id and repeated ids. */
export function readWizardSteps(value: unknown): WizardStep[] {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();
    return value.flatMap((entry): WizardStep[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { id, label, valid } = entry as Record<string, unknown>;
        if (typeof id !== 'string' || id.length === 0 || seen.has(id)) return [];
        seen.add(id);
        return [{ id, label: typeof label === 'string' && label.length > 0 ? label : id, valid: valid !== false }];
    });
}

/** The step to show: the requested one when it exists and every step before it is completed, else the furthest step that is reachable. A refresh can never land past a step that was not done. */
export function reachableStep(steps: WizardStep[], completed: ReadonlySet<string>, requested: string | undefined): string | undefined {
    const wanted = steps.findIndex(step => step.id === requested);
    let furthest = 0;
    while (furthest < steps.length - 1 && completed.has(steps[furthest].id)) furthest++;
    return steps[wanted >= 0 && wanted <= furthest ? wanted : furthest]?.id;
}

/** The status of a step: the current one, a completed one (revisitable), or upcoming. */
export function statusOf(completed: ReadonlySet<string>, current: string | undefined, id: string): StepStatus {
    if (id === current) return StepStatus.Current;
    return completed.has(id) ? StepStatus.Completed : StepStatus.Upcoming;
}

/** Whether a step may be opened from the progress indicator: a completed one, the current one, or the next one when the current is done. */
export function canOpen(steps: WizardStep[], completed: ReadonlySet<string>, id: string): boolean {
    const index = steps.findIndex(step => step.id === id);
    return index === 0 || steps.slice(0, index).every(step => completed.has(step.id));
}

/** The step before or after another, or undefined at either end. */
export const neighbour = (steps: WizardStep[], id: string | undefined, direction: -1 | 1): WizardStep | undefined => steps[steps.findIndex(step => step.id === id) + direction];
