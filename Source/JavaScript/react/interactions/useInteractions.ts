// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo } from 'react';
import { BehaviorAttachment, resolveBehaviors, resolveIntervalBehaviors, runBindings } from '@cratis/scene.engine';
import { Behavior, InteractionTriggerKind } from '@cratis/scene.model';
import { attachmentFor, useInteractionScope } from './InteractionScope';

/**
 * The DOM handlers an element should spread onto whatever it renders.
 *
 * Only the handlers a document actually asks for are present. An element with no `on click` gets no `onClick`,
 * so it does not become clickable - and, just as importantly, does not swallow the click from something
 * enclosing it that does.
 */
export interface InteractionHandlers {
    onClick?: (event: { stopPropagation(): void }) => void;
    onDoubleClick?: (event: { stopPropagation(): void }) => void;
    onChange?: () => void;
    onSubmit?: (event: { preventDefault(): void }) => void;
    onSelect?: () => void;
}

const domTriggers: [keyof InteractionHandlers, InteractionTriggerKind][] = [
    ['onClick', InteractionTriggerKind.Click],
    ['onDoubleClick', InteractionTriggerKind.DoubleClick],
    ['onChange', InteractionTriggerKind.Change],
    ['onSubmit', InteractionTriggerKind.Submit],
    ['onSelect', InteractionTriggerKind.Select],
];

/**
 * Wires the behaviors attached to an element to the events that start them.
 *
 * The hook resolves and runs; it decides nothing. Which bindings a trigger runs, in what order, and where a
 * sequence stops are all the engine's, so a different renderer inherits the same semantics instead of
 * reimplementing them - and so all of it stays testable without a DOM.
 *
 * Lifecycle triggers are handled here rather than by the caller because React is what knows when an element
 * mounts: `load` and `unload` follow the element, and `enter` and `leave` follow the screen. An `interval`
 * becomes a timer that is cleared on unmount, because a document declaring one is asking for it to run while
 * the thing it is attached to is on screen and not afterwards.
 *
 * @param level What is being attached to, used when reporting a finding.
 * @param behaviors The behaviors attached to this element.
 * @returns The handlers to spread onto the rendered element.
 */
export function useInteractions(level: string, behaviors?: Behavior[]): InteractionHandlers {
    const scope = useInteractionScope();

    const attachments = useMemo<BehaviorAttachment[]>(
        () => [...(scope?.attachments ?? []), ...attachmentFor(level, behaviors)],
        [scope, level, behaviors]);

    const run = useCallback(async (kind: InteractionTriggerKind) => {
        if (!scope) return;

        const result = await runBindings(resolveBehaviors(attachments, kind), scope.dispatcher, scope.context);
        if (result.findings.length > 0) scope.onFindings?.(result.findings);
    }, [scope, attachments]);

    // Mount and unmount, for the element and for the screen it is on. Running the unload and leave bindings
    // from the cleanup is what makes them reliable: React guarantees it, a component remembering to call
    // something on the way out does not.
    useEffect(() => {
        void run(InteractionTriggerKind.Load);
        void run(InteractionTriggerKind.Enter);

        return () => {
            void run(InteractionTriggerKind.Unload);
            void run(InteractionTriggerKind.Leave);
        };
    }, [run]);

    useEffect(() => {
        const intervals = resolveIntervalBehaviors(attachments);
        if (intervals.length === 0 || !scope) return;

        const timers = intervals.map(candidate => {
            const seconds = (candidate.binding.trigger as { seconds?: number }).seconds ?? 0;
            return setInterval(
                () => void runBindings([candidate], scope.dispatcher, scope.context),
                Math.max(seconds, 1) * 1000);
        });

        return () => timers.forEach(clearInterval);
    }, [attachments, scope]);

    return useMemo(() => {
        const handlers: InteractionHandlers = {};
        if (!scope) return handlers;

        for (const [handler, kind] of domTriggers) {
            // Nothing attached for this trigger means no handler at all. Attaching an empty one would make
            // every element look interactive and would stop clicks reaching whatever encloses it.
            if (resolveBehaviors(attachments, kind).length === 0) continue;

            if (handler === 'onSubmit') {
                handlers.onSubmit = event => {
                    event.preventDefault();
                    void run(kind);
                };
                continue;
            }

            handlers[handler] = ((event?: { stopPropagation(): void }) => {
                // An interaction that ran here is handled here. Without this, a click on a row inside a table
                // that both declare `on click` would run the table's twice: once for the row, once on the way up.
                event?.stopPropagation();
                void run(kind);
            }) as never;
        }

        return handlers;
    }, [scope, attachments, run]);
}
