// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument, UiProfile } from '@cratis/scene.model';
import {
    type DesignContext, type DesignOperation, type DesignOutcome, type DesignSession, type DesignSessionEvent, type DesignSystemProposal,
    type DesignWorkspace, type ProposedTweak, type ProposedVariation, applyDesignOperations, currentRevisionOf, replaceScreen,
} from '@cratis/scene.design';
import type { DesignIds, ScreenplayBridge } from '../Host/DesignCanvasHost';
import type { DesignTurnRefusal } from '../Host/DesignCanvasHost';

/** What recording a set of design operations needs: the design as it is now and what turns it into session events. */
export interface RecordDesignOperations {
    session: DesignSession;
    workspace: DesignWorkspace;
    context: DesignContext;
    operations: readonly DesignOperation[];
    author: string;
    turnId: string;
    ids: DesignIds;
    bridge: ScreenplayBridge;
    prompt?: string;
    designSystemVersion?: string;
    /** The screen a change that belongs to no screen - the UI profile - is recorded on. */
    focus?: string;
}

/** What came of the operations: the design after them, and the events that remember it. */
export interface RecordedDesignOperations {
    workspace: DesignWorkspace;
    outcomes: DesignOutcome[];
    events: DesignSessionEvent[];
    refusals: DesignTurnRefusal[];
    proposals: DesignSystemProposal[];
    /** The profile when the operations changed it; the host stores it, the canvas only reports it. */
    profile?: UiProfile;
    changed: boolean;
}

interface Named { name: string }

const entitiesOf = (document: SceneDocument, mode: DesignSession['mode']): Named[] =>
    (mode === 'templates' ? document.screenTemplates : document.screens) as unknown as Named[];

const sameEntity = (left: Named | undefined, right: Named | undefined): boolean => JSON.stringify(left) === JSON.stringify(right);

/** The operations that belong to a screen: the ones that name it, and - when it is the focus - the ones that name no screen at all. */
function operationsOf(screen: string, operations: readonly DesignOperation[], focus: string | undefined): DesignOperation[] {
    return operations.filter(operation => {
        const named = operation as { screen?: string; template?: string; name?: string };
        const target = named.screen ?? named.template ?? named.name;
        return target === undefined ? screen === focus : target === screen;
    });
}

/**
 * Applies design operations to the design and says what to remember of it: a revision for every screen the operations changed - all with the
 * turn's id -, the screens taken out, a new order, the layouts and tweaks that were asked for, and what the design system would need. Nothing is
 * applied to a screen that an operation refuses; the refusal comes back with its alternatives.
 */
export async function recordDesignOperations(input: RecordDesignOperations): Promise<RecordedDesignOperations> {
    const { session, workspace, context, bridge, ids, author, turnId } = input;
    const result = applyDesignOperations(workspace, input.operations, context);
    const events: DesignSessionEvent[] = [];

    const before = entitiesOf(workspace.document, session.mode);
    const after = entitiesOf(result.workspace.document, session.mode);
    const changedNames = after.filter(entity => !sameEntity(entity, before.find(candidate => candidate.name === entity.name))).map(entity => entity.name);
    const removed = session.screens.map(entry => entry.screen).filter(name => !after.some(entity => entity.name === name) && before.some(entity => entity.name === name));

    const profileChanged = JSON.stringify(result.workspace.profile) !== JSON.stringify(workspace.profile);
    const touched = [...changedNames];
    if (touched.length === 0 && profileChanged && input.focus !== undefined && session.screens.some(entry => entry.screen === input.focus)) touched.push(input.focus);

    for (const name of touched) {
        const current = currentRevisionOf(session, name);
        const text = await bridge.toText(result.workspace.document, name, session.mode);
        events.push({
            type: 'ScreenRevisionRecorded', revisionId: ids.next('revision'), screen: name, text, operations: operationsOf(name, input.operations, input.focus), author, turnId,
            ...(input.prompt === undefined ? {} : { prompt: input.prompt }),
            ...(input.designSystemVersion === undefined ? {} : { designSystemVersion: input.designSystemVersion }),
            ...(current === undefined ? {} : { basisRevisionId: current.id }),
        });
    }
    for (const name of removed) events.push({ type: 'ScreenRemovedFromDesign', screen: name });

    const known = new Set([...session.screens.map(entry => entry.screen), ...touched]);
    const order = result.workspace.screenSet.screens.filter(name => known.has(name) && !removed.includes(name));
    const currentOrder = [...session.screens.map(entry => entry.screen).filter(name => !removed.includes(name)), ...touched.filter(name => !session.screens.some(entry => entry.screen === name))];
    if (order.length > 0 && order.join('\u0000') !== currentOrder.join('\u0000')) events.push({ type: 'ScreensReordered', screens: order });

    const proposals: DesignSystemProposal[] = [];
    const refusals: DesignTurnRefusal[] = [];
    for (const outcome of result.outcomes) {
        if (!outcome.applied) {
            refusals.push({ code: outcome.code ?? 'refused', reason: outcome.reason ?? '', alternatives: outcome.alternatives ?? [] });
            continue;
        }
        proposals.push(...(outcome.proposals ?? []));
        if (outcome.variations !== undefined && outcome.variations.length > 0 && outcome.operation.op === 'variations') {
            const screen = outcome.operation.screen;
            const candidates: ProposedVariation[] = [];
            for (const candidate of outcome.variations) {
                const template = context.templates.find(entry => entry.name === candidate.template);
                const variant = replaceScreen(workspace, candidate.screen, template);
                candidates.push({ id: ids.next('candidate'), text: await bridge.toText(variant.document, screen, session.mode) });
            }
            events.push({ type: 'VariationsProposed', groupId: ids.next('group'), screen, candidates, ...(input.prompt === undefined ? {} : { prompt: input.prompt }) });
        }
        if (outcome.controls !== undefined && outcome.controls.length > 0) {
            const tweaks: ProposedTweak[] = outcome.controls.map(control => ({ ...control, id: ids.next('tweak') }));
            events.push({ type: 'TweaksProposed', tweaks, ...(input.focus === undefined ? {} : { screen: input.focus }) });
        }
    }

    return {
        workspace: result.workspace, outcomes: result.outcomes, events, refusals, proposals,
        ...(profileChanged && result.workspace.profile !== undefined ? { profile: result.workspace.profile } : {}),
        changed: result.changed,
    };
}

/** What recording an edit made by hand needs: the document as it was and as the editor left it. */
export interface RecordDocumentEdit {
    session: DesignSession;
    before: SceneDocument;
    after: SceneDocument;
    author: string;
    turnId: string;
    ids: DesignIds;
    bridge: ScreenplayBridge;
    designSystemVersion?: string;
}

/**
 * The events of an edit made by hand in the screen editor: a revision for every screen the editor changed. It is a deterministic edit, so no
 * operation is recorded and no prompt. A screen the editor did not touch records nothing.
 */
export async function recordDocumentEdit(input: RecordDocumentEdit): Promise<DesignSessionEvent[]> {
    const { session, bridge, ids } = input;
    const before = entitiesOf(input.before, session.mode);
    const after = entitiesOf(input.after, session.mode);
    const changed = after.filter(entity => !sameEntity(entity, before.find(candidate => candidate.name === entity.name)));
    const events: DesignSessionEvent[] = [];
    for (const entity of changed) {
        const current = currentRevisionOf(session, entity.name);
        events.push({
            type: 'ScreenRevisionRecorded', revisionId: ids.next('revision'), screen: entity.name, text: await bridge.toText(input.after, entity.name, session.mode),
            operations: [], author: input.author, turnId: input.turnId,
            ...(input.designSystemVersion === undefined ? {} : { designSystemVersion: input.designSystemVersion }),
            ...(current === undefined ? {} : { basisRevisionId: current.id }),
        });
    }
    return events;
}
