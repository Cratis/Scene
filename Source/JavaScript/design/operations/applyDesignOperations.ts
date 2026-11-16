// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InsertNodeEdit } from '@cratis/scene.model';
import { findComponent } from '../catalogue/outlets';
import { findDanglingLinks } from '../screenSet/screenSetOperations';
import { DesignOperation } from './DesignOperation';
import { DesignApplyResult, DesignDiagnostic, DesignFocus, DesignOutcome, DesignRefusalCode } from './DesignOutcome';
import { DesignContext, DesignWorkspace } from './DesignWorkspace';
import { applyLowering } from './applyLowering';
import { validateDesignOperation } from './checkOperation';
import { designMessages } from './designMessages';
import { componentNameOf, findElement, resolveTarget } from './documentLookup';
import { lowerOperation } from './lowerOperation';
import { makeVariations } from './variations';

const targetOf = (operation: DesignOperation): { screen?: string; template?: string } => {
    const target: { screen?: string; template?: string } = {};
    const named = operation as { screen?: string; template?: string };
    if (named.screen !== undefined) target.screen = named.screen;
    if (named.template !== undefined) target.template = named.template;
    return target;
};

function refusedOutcome(operation: DesignOperation, code: string, reason: string, alternatives: DesignOutcome['alternatives'], extra: DesignDiagnostic[] = []): DesignOutcome {
    const element = (operation as { element?: string }).element;
    const diagnostic: DesignDiagnostic = { code, severity: 'error', message: reason, ...targetOf(operation), ...(element === undefined ? {} : { element }) };
    return { operation, applied: false, code, reason, alternatives: alternatives ?? [], diagnostics: [diagnostic, ...extra], sceneEdits: [] };
}

function summaryOf(operation: DesignOperation, before: DesignWorkspace, context: DesignContext): string {
    switch (operation.op) {
        case 'addScreen': return designMessages.addedScreen(operation.name, operation.template);
        case 'removeScreen': return designMessages.removedScreen(operation.name);
        case 'moveScreen': return designMessages.movedScreen(operation.name, operation.index);
        case 'addTemplate': return designMessages.addedTemplate(operation.name);
        case 'addSlot': return designMessages.addedSlot(operation.template, operation.slot.name);
        case 'removeSlot': return designMessages.removedSlot(operation.template, operation.slot);
        case 'arrange': return designMessages.arranged(operation.template);
        case 'insert': return designMessages.addedComponent(findComponent(context.catalogue, operation.component)!.label, operation.outlet);
        case 'set': {
            const target = resolveTarget(before.document, operation)!;
            const name = componentNameOf(findElement(target, operation.element)!.element);
            return designMessages.setProperty(operation.prop, findComponent(context.catalogue, name)?.label ?? name);
        }
        case 'remove': return designMessages.removedElement(operation.element);
        case 'move': return designMessages.movedElement(operation.element, operation.outlet);
        case 'link': return designMessages.linked(operation.element, operation.to);
        case 'profile': return designMessages.changedProfile(operation.key);
        case 'variations': return designMessages.variationsOffered(0, operation.screen);
        case 'tweaks': return designMessages.tweaksOffered(operation.controls.length);
        case 'refuse': return '';
    }
}

function focusOf(operation: DesignOperation, sceneEdits: DesignOutcome['sceneEdits']): DesignFocus | undefined {
    switch (operation.op) {
        case 'addScreen': return { screen: operation.name };
        case 'addTemplate': return { template: operation.name };
        case 'addSlot':
        case 'removeSlot':
        case 'arrange': return { template: operation.template };
        case 'insert': return { ...targetOf(operation), element: (sceneEdits[0].edit as InsertNodeEdit).element!.id };
        case 'set':
        case 'move':
        case 'link': return { ...targetOf(operation), element: operation.element };
        case 'remove': return targetOf(operation);
        default: return undefined;
    }
}

function applyOne(workspace: DesignWorkspace, operation: DesignOperation, context: DesignContext): { workspace: DesignWorkspace; outcome: DesignOutcome } {
    if (operation.op === 'variations') {
        const variations = makeVariations(operation.screen, operation.templates, workspace, context);
        const summary = designMessages.variationsOffered(variations.length, operation.screen);
        return { workspace, outcome: { operation, applied: true, summary, diagnostics: [], sceneEdits: [], variations } };
    }
    if (operation.op === 'tweaks') {
        return { workspace, outcome: { operation, applied: true, summary: summaryOf(operation, workspace, context), diagnostics: [], sceneEdits: [], controls: operation.controls } };
    }
    const result = applyLowering(workspace, lowerOperation(operation, workspace, context), context);
    if (result.refusal !== undefined) {
        return { workspace, outcome: refusedOutcome(operation, DesignRefusalCode.SceneRefused, result.refusal, [], result.diagnostics) };
    }
    const diagnostics = [...result.diagnostics];
    if (operation.op === 'removeScreen') {
        for (const link of findDanglingLinks(result.workspace.document, result.workspace.screenSet)) {
            diagnostics.push({ code: 'linkDangling', severity: 'warning', message: designMessages.danglingLink(link.element, link.to), screen: link.from, element: link.element, path: link.prop });
        }
    }
    const outcome: DesignOutcome = { operation, applied: true, summary: summaryOf(operation, workspace, context), diagnostics, sceneEdits: result.sceneEdits };
    const focus = focusOf(operation, result.sceneEdits);
    if (focus !== undefined) outcome.focus = focus;
    return { workspace: result.workspace, outcome };
}

/**
 * Applies design operations in order, each on its own: a refused operation changes nothing, says why and offers the nearest ones that
 * would be accepted, and the operations after it still run against the design as it then is. Applied operations are lowered to Scene
 * edits and applied through the engine, so the document stays one Scene accepts.
 */
export function applyDesignOperations(workspace: DesignWorkspace, operations: readonly DesignOperation[], context: DesignContext): DesignApplyResult {
    let current = workspace;
    const outcomes: DesignOutcome[] = [];
    for (const operation of operations) {
        const validation = validateDesignOperation(operation, current, context);
        if (!validation.ok) {
            outcomes.push(refusedOutcome(operation, validation.code, validation.reason, validation.alternatives));
            continue;
        }
        const step = applyOne(current, operation, context);
        current = step.workspace;
        outcomes.push(step.outcome);
    }
    const changed = outcomes.some(outcome => outcome.applied && outcome.operation.op !== 'tweaks' && outcome.operation.op !== 'variations');
    return { workspace: current, outcomes, changed };
}
