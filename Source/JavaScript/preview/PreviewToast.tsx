// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What a dry run reports (PRV5). */
export interface PreviewInvocation {
    /** The qualified id of the slice. */
    sliceId: string;

    /** The command the slice accepts, when known. */
    command?: string;

    /** The payload that would have been sent. */
    payload: Record<string, unknown>;
}

/**
 * The toast that confirms a dry run: "Command would be sent", with the payload in an expandable detail. Nothing was sent to
 * Chronicle or Arc.
 */
export function PreviewToast({ invocation, onDismiss }: { invocation: PreviewInvocation; onDismiss(): void }) {
    return (
        <div className='scene-preview-toast' role='status' data-scene-preview-toast>
            <strong>Command would be sent</strong>
            <span> · {invocation.command ?? invocation.sliceId}</span>
            <details>
                <summary>Payload</summary>
                <pre>{JSON.stringify(invocation.payload, null, 2)}</pre>
            </details>
            <button type='button' onClick={onDismiss}>Dismiss</button>
        </div>
    );
}
