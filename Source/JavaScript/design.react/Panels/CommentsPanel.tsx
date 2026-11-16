// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import type { DesignComment, DesignSession } from '@cratis/scene.design';
import type { DesignStringKey } from '../Host/DesignCanvasHost';
import type { PinAnchor } from '../State/commentPins';
import './Panels.css';

export interface CommentsPanelProps {
    session: DesignSession;
    screen: string;
    strings: Record<DesignStringKey, string>;
    selected?: string;
    /** The pin waiting for its text: set when the designer dropped one on the screen. */
    pending?: PinAnchor;
    onSelect(commentId: string): void;
    onSubmit(text: string): void;
    onCancelPending(): void;
    onResolve(commentId: string): void;
    onReopen(commentId: string): void;
}

const describeAnchor = (anchor: PinAnchor): string => 'elementId' in anchor ? `on ${anchor.elementId}` : `at ${anchor.position.x}, ${anchor.position.y}`;

const placeOf = (comment: DesignComment): string => comment.elementId !== undefined ? `on ${comment.elementId}` : comment.position !== undefined ? 'pinned' : 'on the screen';

/**
 * The comments of a screen, each about an element - or, when the pin was dropped where no element is, about a place. A new pin waits here for its text.
 * The AI is told the open comments by the element they are on, so what is written next to an element is what it reads when it changes that element.
 */
export const CommentsPanel = ({ session, screen, strings, selected, pending, onSelect, onSubmit, onCancelPending, onResolve, onReopen }: CommentsPanelProps) => {
    const [text, setText] = useState('');
    const comments = session.comments.filter(comment => comment.screen === screen);

    const submit = () => {
        if (text.trim() === '') return;
        onSubmit(text.trim());
        setText('');
    };

    return (
        <div className='design-comments'>
            {pending !== undefined && (
                <form className='design-comments__new' onSubmit={event => { event.preventDefault(); submit(); }}>
                    <label>
                        <span>{strings.addComment} {describeAnchor(pending)}</span>
                        <textarea rows={2} value={text} autoFocus aria-label={strings.addComment} onChange={event => setText(event.target.value)} />
                    </label>
                    <span className='design-comments__actions'>
                        <button type='submit' disabled={text.trim() === ''}>{strings.addComment}</button>
                        <button type='button' onClick={() => { setText(''); onCancelPending(); }}>{strings.cancel}</button>
                    </span>
                </form>
            )}
            {comments.length === 0 && pending === undefined && <p className='design-panel__empty'>{strings.noComments}</p>}
            <ul className='design-comments__list'>
                {comments.map((comment, index) => (
                    <li key={comment.id} className={`design-comments__comment${selected === comment.id ? ' design-comments__comment--selected' : ''}${comment.resolved ? ' design-comments__comment--resolved' : ''}`} data-comment={comment.id}>
                        <button type='button' className='design-comments__text' onClick={() => onSelect(comment.id)}>
                            <span className='design-comments__number'>{index + 1}</span>
                            <span>{comment.text}</span>
                        </button>
                        <span className='design-comments__meta'>{comment.author} · {placeOf(comment)}</span>
                        {comment.resolved
                            ? <button type='button' onClick={() => onReopen(comment.id)}>{strings.reopen}</button>
                            : <button type='button' onClick={() => onResolve(comment.id)}>{strings.resolve}</button>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
