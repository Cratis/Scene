// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The position a column dropped at a pointer takes among the columns of a table: the number of headers whose middle is before the pointer, given the middles of the
// headers from left to right. Undefined when the table shows no headers, so a column dropped there goes to the end.
export const columnAt = (headerMiddles: readonly number[], pointer: number): number | undefined =>
    headerMiddles.length === 0 ? undefined : headerMiddles.filter(middle => middle < pointer).length;

// Where a drop lands on a table the surface draws: the element it is over and, when the table draws headers, the column position under the pointer.
export interface TableDrop {
    elementId: string;
    column?: number;
}

const headerSelector = 'th, [role="columnheader"]';

export function tableDropAt(target: EventTarget | null, pointer: number): TableDrop | undefined {
    const hit = (target as HTMLElement | null)?.closest?.<HTMLElement>('[data-studio-element]');
    const elementId = hit?.dataset.studioElement;
    if (!hit || !elementId) return undefined;
    const middles = [...hit.querySelectorAll<HTMLElement>(headerSelector)].map(header => {
        const rect = header.getBoundingClientRect();
        return rect.left + rect.width / 2;
    });
    return { elementId, column: columnAt(middles, pointer) };
}
