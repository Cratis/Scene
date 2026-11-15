// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { currentRevisionOf, type DesignSession } from '@cratis/scene.design';
import type { DesignStringKey } from '../Host/DesignCanvasHost';
import './Panels.css';

export interface TemplatesPanelProps {
    session: DesignSession;
    strings: Record<DesignStringKey, string>;
    /** Whether the host takes template proposals at all; without it the panel only lists. */
    canPropose: boolean;
    onPropose(template: string): Promise<void>;
}

/**
 * In template mode the results go to the design-system draft, not into any screen set: each template is proposed from here and then follows the
 * design system's own review and activation. A template proposed stays marked until it changes again.
 */
export const TemplatesPanel = ({ session, strings, canPropose, onPropose }: TemplatesPanelProps) => {
    const [proposed, setProposed] = useState<ReadonlyMap<string, string>>(new Map());
    return (
        <ul className='design-templates' aria-label={strings.templates}>
            {session.screens.map(entry => {
                const revision = currentRevisionOf(session, entry.screen);
                const sent = revision !== undefined && proposed.get(entry.screen) === revision.id;
                return (
                    <li key={entry.screen} data-template={entry.screen}>
                        <span>{entry.screen}</span>
                        {sent
                            ? <span className='design-templates__sent'>{strings.proposed}</span>
                            : <button type='button' disabled={!canPropose || revision === undefined} onClick={() => { void onPropose(entry.screen).then(() => setProposed(previous => new Map(previous).set(entry.screen, revision!.id))); }}>{strings.proposeToSystem}</button>}
                    </li>
                );
            })}
        </ul>
    );
};
