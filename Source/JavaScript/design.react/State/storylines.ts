// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    type DesignSession, type DesignSessionEvent, type ScreenLink, type ScreenSet, type Storyline,
    createScreenSet, moveScreenInSet, withStoryline,
} from '@cratis/scene.design';

/**
 * The set of screens the session holds, in its order, with the storylines through them. The default storyline lists every screen and follows the
 * session as screens are added, removed and reordered; the others are the author's and come from the host, which keeps them in its Screenplay.
 */
export function screenSetOf(session: Pick<DesignSession, 'screens'> | undefined, authored: readonly Storyline[] = []): ScreenSet {
    return authored.reduce(withStoryline, createScreenSet(session?.screens.map(entry => entry.screen) ?? []));
}

/** The event that moves a screen to a position in the order, which reorders the default storyline. Nothing when it would not move. */
export function reorderEvents(session: DesignSession, screen: string, index: number): DesignSessionEvent[] {
    const set = screenSetOf(session);
    const moved = moveScreenInSet(set, screen, index);
    return moved.screens.join('\u0000') === set.screens.join('\u0000') ? [] : [{ type: 'ScreensReordered', screens: moved.screens }];
}

/** The screens of a storyline, in its order, as the canvas lays them out: only those the session still has. */
export function stepsOf(set: ScreenSet, storyline: string): string[] {
    const found = storyline === set.defaultStoryline ? undefined : set.storylines.find(candidate => candidate.name === storyline);
    return found === undefined ? [...set.screens] : found.steps.filter(step => set.screens.includes(step));
}

/** The storylines the author made: the set also lists the default one, which follows the screens and is not theirs to keep. */
export const authoredStorylines = (set: ScreenSet): Storyline[] => set.storylines.filter(storyline => storyline.name !== set.defaultStoryline);

/** The names of the storylines to choose between, the default one first. */
export const storylineNames = (set: ScreenSet): string[] => [set.defaultStoryline, ...authoredStorylines(set).map(storyline => storyline.name)];

/** The author's storylines with a screen added at the end of one - or taken out of it when it is already there. */
export function toggleStep(set: ScreenSet, storyline: string, screen: string): Storyline[] {
    return authoredStorylines(set).map(candidate => {
        if (candidate.name !== storyline) return candidate;
        const steps = candidate.steps.includes(screen) ? candidate.steps.filter(step => step !== screen) : [...candidate.steps, screen];
        return { ...candidate, steps };
    });
}

/** A new, empty storyline of the author's; undefined when the name is empty or already taken. */
export function addStoryline(set: ScreenSet, name: string): Storyline[] | undefined {
    const trimmed = name.trim();
    if (trimmed === '' || trimmed === set.defaultStoryline || set.storylines.some(candidate => candidate.name === trimmed)) return undefined;
    return [...authoredStorylines(set), { name: trimmed, steps: [] }];
}

/** A row of the artboards: where the arrows between the screens go. Consecutive steps are joined, and links that jump are drawn apart. */
export interface StoryArrow {
    from: string;
    to: string;
    /** Whether a screen really navigates to the next one, rather than the storyline only putting it next. */
    linked: boolean;
}

/** The arrows between the steps of a storyline: one from each step to the next, marked when a link of the screens says the same. */
export function arrowsOf(steps: readonly string[], links: readonly ScreenLink[]): StoryArrow[] {
    return steps.slice(1).map((to, index) => {
        const from = steps[index]!;
        return { from, to, linked: links.some(link => link.from === from && link.to === to) };
    });
}
