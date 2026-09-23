// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UnresolvedAction } from './UnresolvedAction';

/**
 * The properties of {@link UnresolvedActionHost}.
 */
export interface UnresolvedActionHostProps {
    /** What has been asked for and could not be done. */
    readonly unresolved: readonly UnresolvedAction[];
}

/**
 * Shows what a document asked for that this host cannot do.
 *
 * Only useful while an application is being built, which is why an application that has wired everything will
 * never see it. It is rendered rather than logged because the person who would fix it is usually looking at
 * the screen and not at the console.
 * @param props The {@link UnresolvedActionHostProps}.
 */
export function UnresolvedActionHost({ unresolved }: UnresolvedActionHostProps) {
    if (unresolved.length === 0) return null;

    return (
        <div role="status" data-scene-unresolved style={{ position: 'fixed', bottom: '1rem', left: '1rem', maxWidth: '28rem', padding: '0.625rem 0.75rem', borderRadius: 4, border: '1px solid #c0392b', background: '#fff', color: '#1a1a1a', zIndex: 1000 }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>This surface cannot do what the document asked</strong>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {unresolved.map(action => <li key={action.id}>{action.action}</li>)}
            </ul>
        </div>
    );
}
