// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applyShellSwitch, type ShellSwitchChange, type ShellSwitchPlan } from '@cratis/scene.engine';
import type { SceneDocument, ScreenTemplate } from '@cratis/scene.model';
import { parseStoredDocument } from '../../ScreenEditor/Document/upgradeStoredDocument';

/** What the host needs to apply a shell switch to the saved documents: Scene's plan with every slot decided, and the templates it was worked out with. */
export interface ShellSwitchToApply {
    /** Scene's plan. */
    plan: ShellSwitchPlan;

    /** The screen templates a screen can be built from. */
    templates: readonly ScreenTemplate[];
}

/** A saved document the switch rewrites. */
export interface SavedDocument<TKey> {
    /** What the host knows the document by, to save it back. */
    key: TKey;

    /** The document, as JSON text. */
    document?: string | null;
}

/** A document the switch changed. */
export interface RewrittenDocument<TKey> {
    /** What the host knows the document by. */
    key: TKey;

    /** The document after the switch, as JSON text. */
    document: string;

    /** What changed in it, as Scene describes it. */
    changes: readonly ShellSwitchChange[];
}

/**
 * Applies a shell switch plan to each saved document with Scene's `applyShellSwitch` - the one place the rule lives, in the engine, so Studio only reads and writes.
 * A document that is missing, is not JSON, is not a Scene document or that the plan changes nothing in is left out.
 *
 * @param documents The saved documents.
 * @param application The plan and the templates it was worked out with.
 * @returns The documents that changed, with their new text.
 */
export function applyShellSwitchToDocuments<TKey>(documents: readonly SavedDocument<TKey>[], application: ShellSwitchToApply): RewrittenDocument<TKey>[] {
    const rewritten: RewrittenDocument<TKey>[] = [];
    for (const saved of documents) {
        if (!saved.document) continue;
        let parsed: SceneDocument;
        try {
            parsed = parseStoredDocument<SceneDocument>(saved.document);
        } catch {
            continue;
        }
        if (!Array.isArray(parsed.screens) || !Array.isArray(parsed.screenTemplates)) continue;
        const result = applyShellSwitch(parsed, application.plan, [...application.templates]);
        if (result.applied && result.changes.length > 0) rewritten.push({ key: saved.key, document: JSON.stringify(result.document), changes: result.changes });
    }
    return rewritten;
}
