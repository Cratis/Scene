// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useRef, useState } from 'react';
import { Button } from '@cratis/components/Common';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemConfirmation, DesignSystemHost } from '../DesignSystemHost';

/**
 * Asking the person a question: through the host when it has a way to, otherwise in a bar the editor draws above its sections.
 *
 * @param host The host.
 * @returns The question to ask with, and the bar to draw (nothing while there is no question pending).
 */
export const useConfirmation = (host: DesignSystemHost) => {
    const [pending, setPending] = useState<DesignSystemConfirmation | undefined>();
    const answer = useRef<((yes: boolean) => void) | undefined>(undefined);

    const ask = useCallback((confirmation: DesignSystemConfirmation): Promise<boolean> => {
        if (host.confirm !== undefined) return host.confirm(confirmation);
        return new Promise<boolean>(resolve => {
            answer.current?.(false);
            answer.current = resolve;
            setPending(confirmation);
        });
    }, [host]);

    const respond = useCallback((yes: boolean) => {
        answer.current?.(yes);
        answer.current = undefined;
        setPending(undefined);
    }, []);

    return { ask, pending, respond };
};

export interface ConfirmationBarProps {
    /** The question pending, if any. */
    pending: DesignSystemConfirmation | undefined;

    /** The words to use. */
    strings: DesignSystemEditorStrings['prompts'];

    /** Answers the question. */
    onRespond: (yes: boolean) => void;
}

/** The question the editor asks itself when the host has no way of asking: what is being decided, and a yes and a no. */
export const ConfirmationBar = ({ pending, strings, onRespond }: ConfirmationBarProps) => {
    if (pending === undefined) return null;
    return (
        <div className='studio-design-system__confirmation' role='alertdialog' aria-label={pending.title}>
            <strong>{pending.title}</strong>
            <span>{pending.message}</span>
            <span className='studio-design-system__confirmation-actions'>
                <Button label={strings.yes} onClick={() => onRespond(true)} />
                <Button label={strings.no} variant='outline' onClick={() => onRespond(false)} />
            </span>
        </div>
    );
};
