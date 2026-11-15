// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import type { ScreenEditorLocation } from '../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export const locationPathSeparator = ' / ';

export interface LocationSectionProps {
    location: ScreenEditorLocation | undefined;
    strings: ScreenEditorStrings;
}

// Where the screen lives: the module and features above it, which is the screen's path in Screenplay. The path is only ever
// changed by moving the screen to another feature - the host does that and says whether it could - so it is never typed in.
export const LocationSection = ({ location, strings }: LocationSectionProps) => {
    const text = strings.properties.location;
    const [current, setCurrent] = useState<{ featureId: string; path: readonly string[] }>();
    const [target, setTarget] = useState('');
    const [message, setMessage] = useState<{ kind: 'moved' | 'failed'; text: string }>();
    const [busy, setBusy] = useState(false);
    if (!location) return null;

    const featureId = current?.featureId ?? location.currentFeatureId;
    const path = current?.path ?? location.path;
    const choices = location.features.filter(feature => feature.id !== featureId);

    const move = async () => {
        const chosen = location.features.find(feature => feature.id === target);
        if (!chosen || !location.move) return;
        setBusy(true);
        const failure = await location.move(chosen.id);
        setBusy(false);
        if (failure !== undefined) {
            setMessage({ kind: 'failed', text: failure || text.moveFailed });
            return;
        }
        setCurrent({ featureId: chosen.id, path: chosen.path });
        setTarget('');
        setMessage({ kind: 'moved', text: text.moved(chosen.path.join(locationPathSeparator)) });
    };

    return (
        <section className='studio-editor-properties__location' aria-label={text.title}>
            <strong>{text.title}</strong>
            <div className='studio-editor-properties__location-path'>
                <span>{text.path}</span>
                <ol aria-label={text.path}>
                    {path.map((name, index) => <li key={`${index}:${name}`}>{name}</li>)}
                </ol>
            </div>
            {location.move && choices.length > 0 && (
                <div className='studio-editor-properties__location-move'>
                    <label>
                        <span>{text.moveTo}</span>
                        <select value={target} disabled={busy} onChange={event => setTarget(event.target.value)}>
                            <option value=''>{path.join(locationPathSeparator)}</option>
                            {choices.map(feature => <option key={feature.id} value={feature.id}>{feature.path.join(locationPathSeparator)}</option>)}
                        </select>
                    </label>
                    <button type='button' disabled={busy || target === ''} onClick={() => { void move(); }}>{text.move}</button>
                    <p className='studio-editor-properties__hint'>{text.moveHint}</p>
                </div>
            )}
            {message && <p role={message.kind === 'failed' ? 'alert' : 'status'} className={`studio-editor-properties__location-${message.kind}`}>{message.text}</p>}
        </section>
    );
};
