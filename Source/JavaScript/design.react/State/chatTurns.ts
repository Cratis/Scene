// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemProposal } from '@cratis/scene.design';
import type { DesignTurnProgress, DesignTurnRefusal, DesignTurnResult } from '../Host/DesignCanvasHost';

/** Where a turn of the conversation stands. A refused turn is one the AI answered but whose operations were not (all) accepted. */
export type ChatTurnStatus = 'running' | 'done' | 'refused' | 'failed' | 'cancelled';

/** One thing the designer asked and what became of it. */
export interface ChatTurn {
    id: string;
    prompt: string;
    author: string;
    status: ChatTurnStatus;
    /** What the server said while it worked, in order. */
    progress: string[];
    /** The screens the turn has touched so far. */
    touched: string[];
    reply?: string;
    refusals: DesignTurnRefusal[];
    proposals: DesignSystemProposal[];
    error?: string;
}

export type ChatAction =
    | { type: 'asked'; id: string; prompt: string; author: string }
    | { type: 'progressed'; id: string; progress: DesignTurnProgress }
    | { type: 'answered'; id: string; result: DesignTurnResult }
    | { type: 'failed'; id: string; error: string }
    | { type: 'cancelled'; id: string }
    | { type: 'alternativeTaken'; id: string; refusal: number }
    | { type: 'proposalSent'; id: string; proposal: number };

const update = (turns: readonly ChatTurn[], id: string, change: (turn: ChatTurn) => ChatTurn): ChatTurn[] =>
    turns.map(turn => turn.id === id ? change(turn) : turn);

/** Folds what happens to the conversation: a turn is asked, progresses, and ends answered, failed or cancelled. */
export function chatReducer(turns: readonly ChatTurn[], action: ChatAction): ChatTurn[] {
    switch (action.type) {
        case 'asked':
            return [...turns, { id: action.id, prompt: action.prompt, author: action.author, status: 'running', progress: [], touched: [], refusals: [], proposals: [] }];
        case 'progressed':
            return update(turns, action.id, turn => {
                const { progress } = action;
                if (progress.kind === 'status') return { ...turn, progress: [...turn.progress, progress.message] };
                if (progress.kind === 'reply') return { ...turn, reply: progress.text };
                return turn.touched.includes(progress.screen) ? turn : { ...turn, touched: [...turn.touched, progress.screen] };
            });
        case 'answered':
            return update(turns, action.id, turn => ({
                ...turn, status: action.result.refusals.length > 0 ? 'refused' : 'done', reply: action.result.reply,
                refusals: action.result.refusals, proposals: action.result.proposals,
                touched: [...new Set([...turn.touched, ...action.result.touched])],
            }));
        case 'failed':
            return update(turns, action.id, turn => ({ ...turn, status: 'failed', error: action.error }));
        case 'cancelled':
            return update(turns, action.id, turn => turn.status === 'running' ? { ...turn, status: 'cancelled' } : turn);
        case 'alternativeTaken':
            return update(turns, action.id, turn => ({ ...turn, refusals: turn.refusals.filter((_, index) => index !== action.refusal) }));
        case 'proposalSent':
            return update(turns, action.id, turn => ({ ...turn, proposals: turn.proposals.filter((_, index) => index !== action.proposal) }));
    }
}

/** Whether a turn is still going: the chat bar is busy while one is. */
export const isChatBusy = (turns: readonly ChatTurn[]): boolean => turns.some(turn => turn.status === 'running');

/** The words that say how a turn stands. */
export function chatStatusLabel(turn: ChatTurn, strings: { working: string; refused: string; failed: string; cancelled?: string }): string {
    switch (turn.status) {
        case 'running': return turn.progress[turn.progress.length - 1] ?? strings.working;
        case 'refused': return strings.refused;
        case 'failed': return turn.error ?? strings.failed;
        case 'cancelled': return strings.cancelled ?? 'Cancelled';
        case 'done': return turn.reply ?? '';
    }
}
