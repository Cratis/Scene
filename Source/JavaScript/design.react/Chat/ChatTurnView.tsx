// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignAlternative, DesignSystemProposal } from '@cratis/scene.design';
import type { DesignStringKey } from '../Host/DesignCanvasHost';
import { chatStatusLabel, type ChatTurn } from '../State/chatTurns';

export interface ChatTurnViewProps {
    turn: ChatTurn;
    strings: Record<DesignStringKey, string>;
    onAlternative(refusal: number, alternative: DesignAlternative): void;
    onProposal(proposal: number, send: DesignSystemProposal): void;
    onShowScreen(screen: string): void;
    onRevertTurn?(turnId: string): void;
}

/**
 * One turn of the conversation: what was asked, how it stands - working, done, refused or failed - and what it left to the designer: the
 * alternatives a refusal offers, and the needs the design system lacks. Every alternative is a button that does it.
 */
export const ChatTurnView = ({ turn, strings, onAlternative, onProposal, onShowScreen, onRevertTurn }: ChatTurnViewProps) => (
    <li className={`design-chat__turn design-chat__turn--${turn.status}`} data-turn={turn.id} data-status={turn.status}>
        <p className='design-chat__prompt'><span className='design-chat__author'>{turn.author}</span>{turn.prompt}</p>
        <p className='design-chat__status' role={turn.status === 'failed' ? 'alert' : 'status'}>
            {turn.status === 'running' && <span className='design-chat__spinner' aria-hidden='true' />}
            {chatStatusLabel(turn, strings)}
        </p>
        {turn.status === 'refused' && turn.reply !== undefined && turn.reply !== '' && <p className='design-chat__reply'>{turn.reply}</p>}
        {turn.touched.length > 0 && (
            <p className='design-chat__touched'>
                {turn.touched.map(screen => <button key={screen} type='button' className='design-chat__screen' onClick={() => onShowScreen(screen)}>{screen}</button>)}
                {onRevertTurn !== undefined && turn.status !== 'running' && <button type='button' className='design-chat__undo' onClick={() => onRevertTurn(turn.id)}>{strings.undoTurn}</button>}
            </p>
        )}
        {turn.refusals.map((refusal, index) => (
            <div key={`${refusal.code}-${index}`} className='design-chat__refusal' role='group' aria-label={refusal.reason} data-refusal={refusal.code}>
                <p>{refusal.reason}</p>
                <div className='design-chat__alternatives'>
                    {refusal.alternatives.map(alternative => (
                        <button key={alternative.label} type='button' className='design-chat__alternative' onClick={() => onAlternative(index, alternative)}>{alternative.label}</button>
                    ))}
                </div>
            </div>
        ))}
        {turn.proposals.map((proposal, index) => (
            <div key={`${proposal.kind}-${proposal.summary}-${index}`} className='design-chat__proposal' data-proposal={proposal.kind}>
                <span>{proposal.summary}</span>
                <button type='button' onClick={() => onProposal(index, proposal)}>{strings.proposeToSystem}</button>
            </div>
        ))}
    </li>
);
