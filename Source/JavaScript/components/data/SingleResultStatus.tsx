// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

type State = 'idle' | 'loading' | 'notFound' | 'failure' | 'success';

const messages = { idle: 'Idle', loading: 'Loading', notFound: 'Not found', failure: 'Unable to load result', success: '' };

/** Internal shared presentation; never exposes query exception messages or server stack traces. */
export function SingleResultStatus({ state, value }: { state: State; value?: string }) {
    return <span role={state === 'failure' ? 'alert' : 'status'} data-scene-single-result={state}>
        {state === 'success' ? value : messages[state]}
    </span>;
}
