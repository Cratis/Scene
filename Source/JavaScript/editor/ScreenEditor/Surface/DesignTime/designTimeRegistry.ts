// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import type { ComponentRegistry, RegisteredComponentProps } from '@cratis/scene.react';
import { DesignTimePlaceholder } from './DesignTimePlaceholder';
import { DesignTimePlaceholderTone } from './DesignTimePlaceholderTone';
import { designTimeComponent } from './DesignTimeComponent';
import { designTimeDataComponents } from './designTimeDataComponents';
import type { SurfaceStrings } from './SurfaceStrings';

// The registry the surface draws with: every component of the runtime's registry, drawn for design time. The runtime's own registry
// is left as it is, because Play and every other consumer draws from it.
//
// A component the profile does not provide is not left to the renderer's own red fallback, which sits outside the surface's marks and
// cannot be selected or removed: it is drawn as a note in the same place any other component has.
export function designTimeRegistry(registry: ComponentRegistry, strings: SurfaceStrings): ComponentRegistry {
    // A screenplay table and summary are drawn with sample rows, as the preview draws them with the sample data: the profile's own draw only the headings.
    const replacements = designTimeDataComponents(registry);
    const withData = Object.fromEntries(Object.entries(registry).map(([key, component]) => [key, replacements[key] ?? component]));
    const drawn: ComponentRegistry = Object.fromEntries(Object.entries(withData).map(([key, component]) => [key, designTimeComponent(key, component, strings, registry['PrimeReact:message'])]));
    const unavailable: ComponentRegistry = {};

    return new Proxy(drawn, {
        get: (target, key) => {
            if (typeof key !== 'string') return undefined;
            return target[key] ?? (unavailable[key] ??= unavailableComponent(strings));
        },
    });
}

const unavailableComponent = (strings: SurfaceStrings) => ({ element }: RegisteredComponentProps) =>
    createElement(
        'span',
        { 'data-studio-element': element.id, style: { display: 'contents' } },
        createElement(DesignTimePlaceholder, { elementId: element.id, tone: DesignTimePlaceholderTone.Failed, text: strings.unavailable(element.name || element.componentName) }));
