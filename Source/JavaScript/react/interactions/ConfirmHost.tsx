// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ConfirmRequest } from './ConfirmRequest';

/**
 * The properties of {@link ConfirmHost}.
 */
export interface ConfirmHostProps {
    /** The question waiting on an answer, or `undefined` when nothing is being asked. */
    readonly request?: ConfirmRequest;

    /** The label on the agreeing choice. */
    readonly confirmLabel?: string;

    /** The label on the declining choice. */
    readonly cancelLabel?: string;
}

/**
 * Asks what a document's `confirm` asked, in the page rather than in a browser prompt.
 *
 * The browser's own prompt blocks the event loop and cannot be styled or tested, which is why it is the
 * fallback and not this. Declining is the default action, so dismissing the question stops the sequence - a
 * confirm exists to gate what follows it, and a gate that opens when ignored is not one.
 * @param props The {@link ConfirmHostProps}.
 */
export function ConfirmHost({ request, confirmLabel = 'OK', cancelLabel = 'Cancel' }: ConfirmHostProps) {
    if (!request) return null;

    return (
        <div data-scene-confirm style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', zIndex: 1100 }}>
            <div role="alertdialog" aria-modal="true" aria-label={request.message} style={{ minWidth: '18rem', maxWidth: '28rem', padding: '1rem', borderRadius: 4, background: '#fff', color: '#1a1a1a' }}>
                <p style={{ margin: '0 0 1rem' }}>{request.message}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" onClick={() => request.answer(false)}>{cancelLabel}</button>
                    <button type="button" onClick={() => request.answer(true)}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}
