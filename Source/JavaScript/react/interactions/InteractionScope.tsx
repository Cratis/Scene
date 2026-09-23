// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext, useMemo } from 'react';
import { ActionDispatcher, BehaviorAttachment, InteractionContext, InteractionFinding } from '@cratis/scene.engine';
import { Behavior } from '@cratis/scene.model';

/**
 * What the elements beneath a scope need in order to run an interaction.
 */
export interface InteractionScopeValue {
    /** The seam that performs the effects. */
    dispatcher: ActionDispatcher;

    /** How bindings and localization resolve. */
    context: InteractionContext;

    /** The attachments enclosing this point, outermost first. */
    attachments: BehaviorAttachment[];

    /** Where a finding goes. Absent means nothing is listening, which is itself worth knowing. */
    onFindings?: (findings: InteractionFinding[]) => void;
}

/**
 * The context a scope uses when it was given none.
 *
 * A document whose messages are literal text and whose actions take no arguments resolves nothing, and that is
 * an ordinary document rather than a degenerate one. Requiring a context anyway would make every host invent
 * an empty resolver, and an invented one is a place for a mistake to hide.
 */
const resolvesNothing: InteractionContext = { resolve: () => undefined };

const Scope = createContext<InteractionScopeValue | undefined>(undefined);

/**
 * The properties of {@link InteractionScope}.
 *
 * The context is the one thing an author may leave out, because a document whose messages are literal text and
 * whose actions take no arguments resolves nothing. Everything beneath a scope still reads a context that is
 * definitely there, so only the author is spared, not the code doing the work.
 */
export interface InteractionScopeProps extends Omit<InteractionScopeValue, 'context'> {
    /** How bindings and localization resolve. Omitted means nothing resolves. */
    context?: InteractionContext;

    /** What the scope encloses. */
    children: ReactNode;
}

/**
 * Provides the dispatcher, the resolution context and the enclosing attachments to everything beneath it.
 *
 * Attachments nest: a scope inside another scope appends to it rather than replacing it, so an element's
 * enclosing chain is assembled by the tree rather than reconstructed at each leaf. That is what keeps the
 * additive rule true in a renderer - a module's behavior is still in scope at a button six levels down,
 * without the button knowing the module exists.
 */
export function InteractionScope({ children, dispatcher, context = resolvesNothing, attachments, onFindings }: InteractionScopeProps) {
    const enclosing = useContext(Scope);

    const value = useMemo<InteractionScopeValue>(() => ({
        dispatcher,
        context,
        attachments: [...(enclosing?.attachments ?? []), ...attachments],
        onFindings: onFindings ?? enclosing?.onFindings,
    }), [dispatcher, context, attachments, onFindings, enclosing]);

    return <Scope.Provider value={value}>{children}</Scope.Provider>;
}

/**
 * Reads the enclosing interaction scope.
 *
 * @returns The scope, or `undefined` when the tree is rendered without one.
 * @remarks
 * Rendering without a scope is legitimate - a preview surface showing what a screen looks like has nothing to
 * dispatch to - so this answers `undefined` rather than throwing. What must not happen is an element silently
 * appearing interactive when nothing can run; {@link useInteractions} is where that is decided.
 */
export function useInteractionScope(): InteractionScopeValue | undefined {
    return useContext(Scope);
}

/**
 * Builds the attachment list for one element, so a caller does not have to know the shape.
 *
 * @param level What is being attached to, used when reporting.
 * @param behaviors The behaviors attached there.
 * @returns The attachment, or an empty list when there are none.
 */
export function attachmentFor(level: string, behaviors?: Behavior[]): BehaviorAttachment[] {
    return behaviors && behaviors.length > 0 ? [{ level, behaviors }] : [];
}
