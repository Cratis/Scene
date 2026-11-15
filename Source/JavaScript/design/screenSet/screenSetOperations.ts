// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneDocument } from '@cratis/scene.model';
import { ScreenLink } from './ScreenLink';
import { ScreenSet, defaultStorylineName } from './ScreenSet';
import { Storyline } from './Storyline';

/** A set of the given screens, in that order, with its default storyline walking them. */
export function createScreenSet(screens: readonly string[] = []): ScreenSet {
    return withDefaultStoryline({ screens: [...new Set(screens)], storylines: [], defaultStoryline: defaultStorylineName });
}

/** Rewrites the default storyline from the screen order and leaves the author's storylines as they are. */
function withDefaultStoryline(set: ScreenSet): ScreenSet {
    const others = set.storylines.filter(storyline => storyline.name !== set.defaultStoryline);
    const own = set.storylines.find(storyline => storyline.name === set.defaultStoryline);
    const defaultLine: Storyline = { ...(own?.title === undefined ? {} : { title: own.title }), name: set.defaultStoryline, steps: [...set.screens] };
    return { ...set, storylines: [defaultLine, ...others] };
}

/** Adds a screen at a position - the end when none is given. A screen already in the set stays where it is. */
export function addScreenToSet(set: ScreenSet, name: string, index?: number): ScreenSet {
    if (set.screens.includes(name)) return set;
    const position = index === undefined ? set.screens.length : Math.max(0, Math.min(set.screens.length, index));
    return withDefaultStoryline({ ...set, screens: [...set.screens.slice(0, position), name, ...set.screens.slice(position)] });
}

/** Removes a screen from the set, from the default storyline and from every storyline of the author's. */
export function removeScreenFromSet(set: ScreenSet, name: string): ScreenSet {
    if (!set.screens.includes(name)) return set;
    return withDefaultStoryline({
        ...set,
        screens: set.screens.filter(screen => screen !== name),
        storylines: set.storylines.map(storyline => ({ ...storyline, steps: storyline.steps.filter(step => step !== name) })),
    });
}

/** Moves a screen to a position, clamped to the set; the default storyline follows. */
export function moveScreenInSet(set: ScreenSet, name: string, index: number): ScreenSet {
    if (!set.screens.includes(name)) return set;
    const rest = set.screens.filter(screen => screen !== name);
    const position = Math.max(0, Math.min(rest.length, index));
    return withDefaultStoryline({ ...set, screens: [...rest.slice(0, position), name, ...rest.slice(position)] });
}

/** Adds an author's storyline, or replaces the one of that name. Steps that name no screen of the set are dropped. The default storyline is not the author's to change. */
export function withStoryline(set: ScreenSet, storyline: Storyline): ScreenSet {
    if (storyline.name === set.defaultStoryline) return set;
    const kept: Storyline = { ...storyline, steps: storyline.steps.filter(step => set.screens.includes(step)) };
    const exists = set.storylines.some(candidate => candidate.name === storyline.name);
    return { ...set, storylines: exists ? set.storylines.map(candidate => candidate.name === storyline.name ? kept : candidate) : [...set.storylines, kept] };
}

const isDestination = (value: unknown): value is { screen: string } =>
    typeof value === 'object' && value !== null && typeof (value as { screen?: unknown }).screen === 'string';

function elementsOf(value: unknown, found: Record<string, unknown>[]): void {
    if (Array.isArray(value)) {
        for (const item of value) elementsOf(item, found);
    } else if (typeof value === 'object' && value !== null) {
        const record = value as Record<string, unknown>;
        if (typeof record.id === 'string' && typeof record.properties === 'object' && record.properties !== null) found.push(record);
        for (const child of Object.values(record)) elementsOf(child, found);
    }
}

/** Every place a screen of the document navigates to another screen, in document order. */
export function findScreenLinks(document: SceneDocument): ScreenLink[] {
    const links: ScreenLink[] = [];
    for (const screen of document.screens) {
        const elements: Record<string, unknown>[] = [];
        elementsOf(screen.slotContent, elements);
        for (const element of elements) {
            for (const [prop, value] of Object.entries(element.properties as Record<string, unknown>)) {
                if (isDestination(value)) links.push({ from: screen.name, element: element.id as string, prop, to: value.screen });
            }
        }
    }
    return links;
}

/** The links that go to a screen the set does not have. */
export const findDanglingLinks = (document: SceneDocument, set: ScreenSet): ScreenLink[] =>
    findScreenLinks(document).filter(link => !set.screens.includes(link.to));

/** The screens no other screen of the set navigates to - the entry points, and any screen nothing leads to. */
export function findUnreachedScreens(document: SceneDocument, set: ScreenSet): string[] {
    const targets = new Set(findScreenLinks(document).filter(link => link.from !== link.to).map(link => link.to));
    return set.screens.filter(screen => !targets.has(screen));
}
