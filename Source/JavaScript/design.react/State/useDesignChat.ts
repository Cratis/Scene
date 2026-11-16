// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { DesignAlternative, DesignSystemProposal } from '@cratis/scene.design';
import type { DesignCanvasHost, DesignIds } from '../Host/DesignCanvasHost';
import { randomDesignIds } from '../Host/randomDesignIds';
import { chatReducer, isChatBusy, type ChatTurn } from './chatTurns';
import type { DesignModel } from './useDesignModel';

/** What the designer was looking at when they asked. */
export interface ChatFocus {
    screen?: string;
    element?: string;
}

export interface DesignChat {
    turns: readonly ChatTurn[];
    busy: boolean;
    /** Whether there is a server to ask at all. */
    available: boolean;
    ask(prompt: string, focus?: ChatFocus): void;
    cancel(): void;
    /** Takes an alternative a refusal offered: the operations are applied as the designer's own change, a proposal goes to the design system. */
    takeAlternative(turnId: string, refusal: number, alternative: DesignAlternative): Promise<void>;
    /** Sends a need the turn found the design system lacking. */
    sendProposal(turnId: string, proposal: number, send: DesignSystemProposal): Promise<void>;
}

/**
 * The conversation with the host's AI: a turn is asked on the server, which records its own revisions, and shows here as it progresses and ends -
 * done, refused with alternatives that can be taken, or failed. Cancelling stops waiting and asks the server to stop.
 */
export function useDesignChat(host: DesignCanvasHost, model: DesignModel): DesignChat {
    const ids: DesignIds = host.ids ?? randomDesignIds;
    const [turns, dispatch] = useReducer(chatReducer, [] as ChatTurn[]);
    const running = useRef<{ id: string; controller: AbortController } | undefined>(undefined);

    useEffect(() => () => running.current?.controller.abort(), []);

    const ask = useCallback((prompt: string, focus?: ChatFocus) => {
        const transport = host.ai;
        const session = model.session;
        const text = prompt.trim();
        if (transport === undefined || session === undefined || text === '' || running.current !== undefined) return;
        const id = ids.next('turn');
        const controller = new AbortController();
        running.current = { id, controller };
        dispatch({ type: 'asked', id, prompt: text, author: host.user.id });
        transport.runTurn(
            {
                turnId: id, sessionId: session.id, subject: host.subject, mode: session.mode, prompt: text, author: host.user.id,
                ...(focus === undefined ? {} : { focus }), ...(session.templateSet === undefined ? {} : { templateSet: session.templateSet }),
            },
            progress => dispatch({ type: 'progressed', id, progress }),
            controller.signal,
        ).then(
            result => dispatch({ type: 'answered', id, result }),
            (error: unknown) => {
                if (controller.signal.aborted) dispatch({ type: 'cancelled', id });
                else dispatch({ type: 'failed', id, error: error instanceof Error ? error.message : String(error) });
            },
        ).finally(() => { if (running.current?.id === id) running.current = undefined; });
    }, [host, model.session, ids]);

    const cancel = useCallback(() => {
        const current = running.current;
        if (current === undefined) return;
        current.controller.abort();
        dispatch({ type: 'cancelled', id: current.id });
    }, []);

    const takeAlternative = useCallback(async (turnId: string, refusal: number, alternative: DesignAlternative) => {
        if (alternative.operations !== undefined && alternative.operations.length > 0) await model.actions.record(alternative.operations, { prompt: alternative.label });
        if (alternative.proposal !== undefined) await model.actions.proposeToSystem(alternative.proposal);
        dispatch({ type: 'alternativeTaken', id: turnId, refusal });
    }, [model.actions]);

    const sendProposal = useCallback(async (turnId: string, proposal: number, send: DesignSystemProposal) => {
        await model.actions.proposeToSystem(send);
        dispatch({ type: 'proposalSent', id: turnId, proposal });
    }, [model.actions]);

    return useMemo(() => ({
        turns, busy: isChatBusy(turns), available: host.ai !== undefined, ask, cancel, takeAlternative, sendProposal,
    }), [turns, host.ai, ask, cancel, takeAlternative, sendProposal]);
}
