// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Layout, SceneDocument, Slot } from '@cratis/scene.model';
import type { ScreenTemplate } from '@cratis/scene.model';
import { screenName } from '../Document/studioScreen';

// A routed slot filled with another screen that follows what is selected in a table: Screenplay's `show <Screen> by <parameter> from <element>.selection`
// written under the slot of the template the screen fills.
export interface DetailShow {
    slot: string;
    screen: string;
    by: string;
    element: string;
}

interface NativeEntry {
    at: number;
    text: string;
}

type NativeScreen = { native?: { slots?: Record<string, NativeEntry[]> } };

const showLine = /^show\s+(\S+)\s+by\s+(\S+)\s+from\s+(\S+?)\.selection\s*$/;

export const showText = (show: Omit<DetailShow, 'slot'>): string => `show ${show.screen} by ${show.by} from ${show.element}.selection`;

// The name Screenplay gives a component of a screen: its id with everything that is not a letter, a digit or an underscore left out.
export function screenplayNameOf(elementId: string): string {
    const kept = [...elementId].filter(character => /[A-Za-z0-9_]/.test(character)).join('');
    if (kept.length === 0) return 'Unnamed';
    return /^[0-9]/.test(kept) ? `_${kept}` : kept;
}

const screenOf = (document: SceneDocument): (SceneDocument['screens'][number] & NativeScreen) | undefined =>
    document.screens.find(screen => screen.name === screenName) as (SceneDocument['screens'][number] & NativeScreen) | undefined;

// The slots the screen fills with another screen that follows a selection.
export function detailShowsOf(document: SceneDocument): DetailShow[] {
    const slots = screenOf(document)?.native?.slots ?? {};
    return Object.entries(slots).flatMap(([slot, entries]) => entries.flatMap(entry => {
        const match = showLine.exec(entry.text.trim());
        return match ? [{ slot, screen: match[1], by: match[2], element: match[3] }] : [];
    }));
}

// The document with the slot filled with the screen that follows the selection - or the slot left to what else it holds when none is given. What the slot
// keeps natively beside it stays.
export function withDetailShow(document: SceneDocument, slot: string, show: Omit<DetailShow, 'slot'> | undefined): SceneDocument {
    const target = screenOf(document);
    if (!target) return document;
    const native = target.native ?? {};
    const entries = (native.slots?.[slot] ?? []).filter(entry => !showLine.test(entry.text.trim()));
    const next = show ? [...entries, { at: (target.slotContent[slot] ?? []).length, text: showText(show) }] : entries;
    const slots = { ...(native.slots ?? {}), [slot]: next };
    if (next.length === 0) delete slots[slot];
    const { slots: _, ...rest } = native;
    const kept = { ...rest, ...(Object.keys(slots).length > 0 ? { slots } : {}) };
    const { native: _native, ...others } = target;
    const changed = Object.keys(kept).length > 0 ? { ...others, native: kept } : others;
    return { ...document, screens: document.screens.map(screen => screen === target ? changed : screen) };
}

// A slot a template or a layout declares that is addressed by route values: the ones a selection can fill with a screen.
export interface RoutedSlot {
    name: string;
    routedBy: readonly string[];
}

// The slots the screen's template - or its layout, when it fills none - declares.
function declaredSlotsOf(document: SceneDocument, templates: readonly ScreenTemplate[], layouts: readonly Layout[]): readonly Slot[] {
    const screen = document.screens.find(candidate => candidate.name === screenName);
    return (screen?.screenTemplate ? templates.find(template => template.name === screen.screenTemplate)?.slots : layouts.find(layout => layout.name === screen?.layout)?.slots) ?? [];
}

// Whether the page the screen sits in is addressed: a filter set on it is kept in the address, so a reload or a shared link opens the same filtered list.
export const hasRoutedSlot = (document: SceneDocument, templates: readonly ScreenTemplate[], layouts: readonly Layout[]): boolean =>
    declaredSlotsOf(document, templates, layouts).some(slot => slot.routed === true);

export function routedSlotsOf(document: SceneDocument, templates: readonly ScreenTemplate[], layouts: readonly Layout[]): RoutedSlot[] {
    const declared = declaredSlotsOf(document, templates, layouts);
    return declared.filter(slot => slot.routed === true && (slot.routedBy ?? []).length > 0).map(slot => ({ name: slot.name, routedBy: slot.routedBy ?? [] }));
}
