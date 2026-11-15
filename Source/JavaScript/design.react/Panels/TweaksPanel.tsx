// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { colourTokenValues, type DesignContext } from '@cratis/scene.design';
import type { DesignStringKey } from '../Host/DesignCanvasHost';
import { accentForHue, hueForAccent, type ActiveTweak } from '../State/tweakControls';
import './Panels.css';

export interface TweaksPanelProps {
    tweaks: readonly ActiveTweak[];
    context: DesignContext;
    strings: Record<DesignStringKey, string>;
    onChange(tweakId: string, value: string): void;
    onDismiss(tweakId: string): void;
}

/**
 * The tweak controls that stay with a screen until they are dismissed: a hue slider or a choice. Moving one is a deterministic edit and a revision of
 * its own - no AI is asked - so a tweak can be tried and gone back from like any other change.
 */
export const TweaksPanel = ({ tweaks, context, strings, onChange, onDismiss }: TweaksPanelProps) => {
    if (tweaks.length === 0) return <p className='design-panel__empty'>{strings.noTweaks}</p>;
    return (
        <ul className='design-tweaks' aria-label={strings.tweaks}>
            {tweaks.map(({ record, resolved }) => {
                // A hue moves the accent along the colours the design system has: its colour tokens are what an accent may be.
                const accents = record.kind === 'hue' ? colourTokenValues(context.catalogue) : [];
                return (
                    <li key={record.id} className='design-tweaks__control' data-tweak={record.id}>
                        <label>
                            <span className='design-tweaks__label'>{record.label}</span>
                            {record.kind === 'hue'
                                ? (
                                    <input
                                        type='range' min={0} max={359} aria-label={record.label}
                                        defaultValue={hueForAccent(resolved.value, accents)}
                                        onChange={event => { const accent = accentForHue(Number(event.target.value), accents); if (accent !== undefined && accent !== resolved.value) onChange(record.id, accent); }} />
                                )
                                : (
                                    <select aria-label={record.label} value={resolved.value} onChange={event => onChange(record.id, event.target.value)}>
                                        {!resolved.options.includes(resolved.value) && <option value={resolved.value}>{resolved.value}</option>}
                                        {resolved.options.map(option => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                )}
                        </label>
                        <button type='button' className='design-tweaks__dismiss' aria-label={`Dismiss ${record.label}`} onClick={() => onDismiss(record.id)}>×</button>
                    </li>
                );
            })}
        </ul>
    );
};
