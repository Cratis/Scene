// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One task of a checklist. */
export interface ChecklistItem {
    id: string;
    label: string;
    owner?: string;
    due?: string;
    done: boolean;
}

/** A titled group of tasks. */
export interface ChecklistGroup {
    title: string;
    items: ChecklistItem[];
}

/** Reads checklist groups out of a property value; a task needs an id and a label, and is open unless it says it is done. */
export function readChecklist(value: unknown): ChecklistGroup[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry): ChecklistGroup[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { title, items } = entry as Record<string, unknown>;
        if (typeof title !== 'string' || !Array.isArray(items)) return [];

        return [{
            title,
            items: items.flatMap((item): ChecklistItem[] => {
                if (typeof item !== 'object' || item === null || Array.isArray(item)) return [];
                const { id, label, owner, due, done } = item as Record<string, unknown>;
                if (typeof id !== 'string' || typeof label !== 'string') return [];
                return [{ id, label, done: done === true, ...(typeof owner === 'string' ? { owner } : {}), ...(typeof due === 'string' ? { due } : {}) }];
            }),
        }];
    });
}

/** How many of a group's tasks are done. */
export const completed = (group: ChecklistGroup): number => group.items.filter(item => item.done).length;

/** Whether an open task is past its due date, today counting as not yet late. */
export function isOverdue(item: ChecklistItem, now: Date): boolean {
    if (item.done || item.due === undefined) return false;

    const due = new Date(item.due);
    if (Number.isNaN(due.getTime())) return false;

    const endOfDue = new Date(due);
    endOfDue.setUTCHours(23, 59, 59, 999);
    return endOfDue.getTime() < now.getTime();
}

/** Marks one task done or open, leaving every other as it was. */
export const toggleTask = (groups: ChecklistGroup[], id: string): ChecklistGroup[] =>
    groups.map(group => (group.items.some(item => item.id === id)
        ? { ...group, items: group.items.map(item => (item.id === id ? { ...item, done: !item.done } : item)) }
        : group));

/** The ids of every done task: what the checklist publishes. */
export const doneTaskIds = (groups: ChecklistGroup[]): string[] => groups.flatMap(group => group.items.filter(item => item.done).map(item => item.id));
