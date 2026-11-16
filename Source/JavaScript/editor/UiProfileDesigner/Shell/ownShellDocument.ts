// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateRole, TemplateScope, type Layout, type ScreenTemplate, type Slot } from '@cratis/scene.model';
import type { EffectiveShell } from '@cratis/scene.engine';

/** Where a new shell of the application's own starts from. */
export enum NewShellStart {
    /** One slot, `content`: nothing but a place for the screen. */
    Blank = 'blank',

    /** A copy of the shell the application has now. */
    CopyOfCurrent = 'copyOfCurrent',

    /** A copy of the blueprint's AppShell, whatever the application uses now. */
    FromAppShell = 'fromAppShell',
}

/** The layout every application template sits in, the one the server starts a new template from. */
const studioScreen = { name: 'StudioScreen', slots: [{ name: 'content' }] };

const emptyCollections = { dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] };

/**
 * The Scene document of a new shell of the application's own: a template that is the application's root (role `Root`, scope `Application`), with the slots the
 * shell it starts from has, seeded so the screens placed in the shell it replaces still have somewhere to go. The slot the screens go in is marked `primary`.
 * The document is the one place that says so - nothing about a shell lives only in Studio - so Stage, Scene and the CLI read the same.
 *
 * @param start Where it starts from.
 * @param from The shell it is copied from; for a blank start, nothing of it is looked at.
 * @param id The identifier of the application template that is being made; it is the name the document knows the template by.
 * @param displayName What the author called the shell.
 * @returns The document, as JSON text.
 */
export function ownShellDocument(start: NewShellStart, from: EffectiveShell | undefined, id: string, displayName: string): string {
    const source = start === NewShellStart.Blank || from === undefined ? undefined : from.template;
    const primarySlot = source === undefined || from === undefined ? 'content' : from.primarySlot;

    const template: ScreenTemplate = {
        name: id,
        displayName,
        slots: slotsOf(source === undefined ? [{ name: 'content' }] : source.slots, from === undefined || source === undefined ? [] : from.slots, primarySlot),
        ...(source?.arrangement === undefined ? {} : { arrangement: structuredClone(source.arrangement) }),
        ...(source !== undefined && 'content' in source && source.content ? { content: structuredClone(source.content) as ScreenTemplate['content'] } : {}),
        ...(source?.behaviors === undefined ? {} : { behaviors: structuredClone(source.behaviors) }),
        metadata: {
            category: 'Shell',
            scopes: [TemplateScope.Application],
            role: TemplateRole.Root,
        },
    };

    return JSON.stringify({ layouts: [studioScreen satisfies Pick<Layout, 'name' | 'slots'>], screenTemplates: [template], ...emptyCollections });
}

// The slots of the shell it starts from, every slot the effective shell offers among them, and only the primary one marked primary.
function slotsOf(declared: readonly Slot[], offered: readonly string[], primarySlot: string): Slot[] {
    const names = new Set(declared.map(slot => slot.name));
    const slots: Slot[] = [...declared.map(slot => ({ ...slot })), ...offered.filter(name => !names.has(name)).map(name => ({ name }))];
    return slots.map(slot => {
        const { primary: _, ...rest } = slot;
        return slot.name === primarySlot ? { ...rest, primary: true } : rest;
    });
}
