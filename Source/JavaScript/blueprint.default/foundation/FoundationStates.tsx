// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentRegistryKey, SceneThemeProvider } from '@cratis/scene.react';
import { defaultBlueprintComponents } from '../defaultBlueprintComponents';
import { defaultBlueprintName } from '../packageName';
import { darkTheme, lightTheme } from '../themes';
import { ComponentState, componentStates } from './ComponentState';
import { foundationElement, foundationSamples } from './foundationSamples';

export interface FoundationStatesProps {
    /** The bare name of the foundation component. */
    component: string;

    /** The theme the states are drawn in. */
    theme: 'light' | 'dark';

    /** Properties to lay over the sample, to show a variant. */
    properties?: Record<string, unknown>;

    /** Whether the page reads right to left. */
    rightToLeft?: boolean;
}

/**
 * Every standard state of one foundation component side by side in one theme: the preview of spec Part B 6 ("all standard states
 * implemented and previewable"), used by the stories and by the gallery.
 */
export function FoundationStates({ component, theme, properties, rightToLeft }: FoundationStatesProps) {
    const Component = defaultBlueprintComponents[componentRegistryKey(defaultBlueprintName, component)];
    const sample = foundationSamples[component];
    const states = sample?.stateful ? componentStates : [ComponentState.Ready];

    return (
        <SceneThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
            <div dir={rightToLeft ? 'rtl' : 'ltr'} className='foundation-states' style={{ display: 'grid', gap: '1rem', padding: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))', background: 'var(--scene-surface-background)', color: 'var(--scene-text-color)' }}>
                {states.map(state => (
                    <figure key={state} style={{ margin: 0, minInlineSize: 0 }}>
                        <figcaption style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBlockEnd: '0.5rem' }}>{state}</figcaption>
                        <Component element={foundationElement(component, { ...sample?.properties, ...properties }, state === ComponentState.Ready ? undefined : state)} slots={{}} />
                    </figure>
                ))}
            </div>
        </SceneThemeProvider>
    );
}
