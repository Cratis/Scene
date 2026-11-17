// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { designSubjectKey, type DesignSubject } from '@cratis/scene.design';

/** A screen of the overview: the host's reading of one subject's current revision. */
export interface OverviewScreen {
    name: string;
    document: SceneDocument;
    /** Said next to the name: the template the screen is built on. */
    caption?: string;
}

/** The screens one subject (a story, an issue, ...) has, as the host supplies them. */
export interface OverviewSubject {
    subject: DesignSubject;
    title: string;
    screens: readonly OverviewScreen[];
}

/** How the overview is narrowed: by words in a title or a screen's name, and by the kind of subject. */
export interface OverviewFilter {
    text?: string;
    kind?: DesignSubject['kind'];
}

/**
 * The subjects that have screens, narrowed by the filter. A subject whose title matches keeps all its screens; otherwise only the screens
 * that match - by their own name and caption, or together with the subject's title, so "overdue list" finds the list of the overdue story.
 */
export function filterOverview(subjects: readonly OverviewSubject[], filter: OverviewFilter = {}): OverviewSubject[] {
    const words = (filter.text ?? '').toLowerCase().split(/\s+/).filter(word => word !== '');
    const matches = (value: string): boolean => words.every(word => value.toLowerCase().includes(word));
    return subjects
        .filter(entry => filter.kind === undefined || entry.subject.kind === filter.kind)
        .map(entry => words.length === 0 || matches(entry.title) ? entry : { ...entry, screens: entry.screens.filter(screen => matches(`${entry.title} ${screen.name} ${screen.caption ?? ''}`)) })
        .filter(entry => entry.screens.length > 0);
}

/** The number of screens across every subject: what the "Screens" tab says it holds. */
export const countScreens = (subjects: readonly OverviewSubject[]): number => subjects.reduce((sum, entry) => sum + entry.screens.length, 0);

/** The subject kinds present, in the order first met: what the kind filter offers. */
export const kindsOf = (subjects: readonly OverviewSubject[]): DesignSubject['kind'][] => [...new Set(subjects.map(entry => entry.subject.kind))];

/** A stable key for a screen of the overview. */
export const overviewScreenKey = (subject: DesignSubject, screen: string): string => `${designSubjectKey(subject)}/${screen}`;
