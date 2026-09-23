// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Behavior, InteractionBinding, InteractionTrigger, InteractionTriggerKind } from '@cratis/scene.model';

/**
 * One level of the containment tree a behavior can be attached to, outermost first.
 *
 * Named rather than positional so a finding can say *where* a behavior came from - 'the module's behavior ran
 * before the element's' is only a useful thing to report if the level has a name.
 */
export interface BehaviorAttachment {
    level: string;
    behaviors: Behavior[];
}

/**
 * One binding to run, with the attachment it came from.
 */
export interface ResolvedBinding {
    level: string;
    behaviorName?: string;
    binding: InteractionBinding;
}

/**
 * Whether the trigger is the built-in kind asked for.
 */
function isKind(trigger: InteractionTrigger, kind: InteractionTriggerKind): boolean {
    return (trigger as { kind?: InteractionTriggerKind }).kind === kind;
}

/**
 * Collects the bindings that respond to a built-in interaction kind, in the order they run.
 *
 * Attachments are **additive**: a behavior on a template and a behavior on an element both run, rather than the
 * more specific one replacing the less specific one. The order is outermost attachment first, declaration order
 * within a level, and any behavior that declares an `order` sorts by it.
 *
 * The additive rule is what lets a module say 'confirm every destructive action' without every screen beneath it
 * having to cooperate - but it also means the order has to be deterministic, or the same document behaves
 * differently between runs. That is why this is a pure function over an ordered list rather than something
 * assembled while rendering.
 *
 * @param attachments The attachment levels, outermost first.
 * @param kind The built-in interaction kind that occurred.
 * @returns The bindings to run, in order.
 */
export function resolveBehaviors(attachments: BehaviorAttachment[], kind: InteractionTriggerKind): ResolvedBinding[] {
    const resolved: { entry: ResolvedBinding; level: number; declaration: number; order?: number }[] = [];

    attachments.forEach((attachment, level) => {
        let declaration = 0;
        for (const behavior of (attachment.behaviors ?? [])) {
            for (const binding of (behavior.bindings ?? [])) {
                if (!isKind(binding.trigger, kind)) continue;

                resolved.push({
                    entry: { level: attachment.level, behaviorName: behavior.name, binding },
                    level,
                    declaration: declaration++,
                    order: behavior.order,
                });
            }
        }
    });

    // An explicit order wins over position; everything else keeps the order it was written in. Sorting is
    // stable on (order, level, declaration) so the result never depends on the sort implementation.
    return resolved
        .sort((left, right) => {
            if (left.order !== right.order) {
                if (left.order === undefined) return 1;
                if (right.order === undefined) return -1;
                return left.order - right.order;
            }

            return left.level !== right.level ? left.level - right.level : left.declaration - right.declaration;
        })
        .map(candidate => candidate.entry);
}

/**
 * Collects the bindings that respond to a named application trigger firing.
 *
 * @param attachments The attachment levels, outermost first.
 * @param triggerName The application trigger that fired.
 * @returns The bindings to run, in order.
 */
export function resolveApplicationTriggerBehaviors(attachments: BehaviorAttachment[], triggerName: string): ResolvedBinding[] {
    return collect(attachments, trigger => (trigger as { triggerName?: string }).triggerName === triggerName);
}

/**
 * Collects the bindings that respond to a modeled domain event being observed.
 *
 * @param attachments The attachment levels, outermost first.
 * @param eventName The event that was observed.
 * @returns The bindings to run, in order.
 */
export function resolveEventBehaviors(attachments: BehaviorAttachment[], eventName: string): ResolvedBinding[] {
    return collect(attachments, trigger => (trigger as { eventName?: string }).eventName === eventName);
}

/**
 * Collects every interval binding, so a host can schedule them.
 *
 * @param attachments The attachment levels, outermost first.
 * @returns The interval bindings, in order.
 */
export function resolveIntervalBehaviors(attachments: BehaviorAttachment[]): ResolvedBinding[] {
    return collect(attachments, trigger => typeof (trigger as { seconds?: number }).seconds === 'number');
}

function collect(attachments: BehaviorAttachment[], matches: (trigger: InteractionTrigger) => boolean): ResolvedBinding[] {
    const resolved: ResolvedBinding[] = [];
    for (const attachment of attachments) {
        for (const behavior of (attachment.behaviors ?? [])) {
            for (const binding of (behavior.bindings ?? [])) {
                if (matches(binding.trigger)) {
                    resolved.push({ level: attachment.level, behaviorName: behavior.name, binding });
                }
            }
        }
    }

    return resolved;
}
