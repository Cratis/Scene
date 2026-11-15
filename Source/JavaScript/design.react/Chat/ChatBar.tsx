// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { DesignAlternative, DesignSystemProposal } from '@cratis/scene.design';
import type { DesignStringKey } from '../Host/DesignCanvasHost';
import type { DesignChat } from '../State/useDesignChat';
import { ChatTurnView } from './ChatTurnView';
import './ChatBar.css';

export interface ChatBarProps {
    chat: DesignChat;
    strings: Record<DesignStringKey, string>;
    /** What the designer is looking at, sent with what they ask. */
    focus?: { screen?: string; element?: string };
    onShowScreen(screen: string): void;
    onRevertTurn?(turnId: string): void;
}

/** The chat bar: the conversation above, the box to ask in below. Enter asks, Shift+Enter breaks the line, and a turn that runs can be cancelled. */
export const ChatBar = ({ chat, strings, focus, onShowScreen, onRevertTurn }: ChatBarProps) => {
    const [prompt, setPrompt] = useState('');
    const history = useRef<HTMLOListElement>(null);

    useEffect(() => { history.current?.scrollTo?.({ top: history.current.scrollHeight }); }, [chat.turns]);

    const send = (event?: FormEvent) => {
        event?.preventDefault();
        if (prompt.trim() === '' || chat.busy) return;
        chat.ask(prompt, focus);
        setPrompt('');
    };

    const keys = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); }
    };

    return (
        <section className='design-chat' aria-label='Design chat'>
            {chat.turns.length > 0 && (
                <ol ref={history} className='design-chat__turns'>
                    {chat.turns.map(turn => (
                        <ChatTurnView
                            key={turn.id}
                            turn={turn}
                            strings={strings}
                            onAlternative={(refusal: number, alternative: DesignAlternative) => { void chat.takeAlternative(turn.id, refusal, alternative); }}
                            onProposal={(proposal: number, send: DesignSystemProposal) => { void chat.sendProposal(turn.id, proposal, send); }}
                            onShowScreen={onShowScreen}
                            {...(onRevertTurn === undefined ? {} : { onRevertTurn })} />
                    ))}
                </ol>
            )}
            <form className='design-chat__form' onSubmit={send}>
                <textarea
                    className='design-chat__input'
                    rows={2}
                    value={prompt}
                    placeholder={strings.chatPlaceholder}
                    aria-label={strings.chatPlaceholder}
                    disabled={!chat.available}
                    onChange={event => setPrompt(event.target.value)}
                    onKeyDown={keys} />
                {chat.busy
                    ? <button type='button' className='design-chat__cancel' onClick={chat.cancel}>{strings.cancel}</button>
                    : <button type='submit' className='design-chat__send' disabled={!chat.available || prompt.trim() === ''}>{strings.send}</button>}
            </form>
        </section>
    );
};
