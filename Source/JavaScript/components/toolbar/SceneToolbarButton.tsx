// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext } from 'react';
import { ToolbarButton } from '@cratis/components/Toolbar';
import { DestinationReference } from '@cratis/scene.model';
import { RegisteredComponentProps, SceneNavigationContextInternal } from '@cratis/scene.react';
import { booleanProperty, stringProperty, unionProperty } from '../properties';

/** Which side of the button its tooltip appears on. */
const tooltipPositions = ['top', 'right', 'bottom', 'left'] as const;

/**
 * The `Cratis.Components:toolbarButton` component - `ToolbarButton` from `@cratis/components/Toolbar`.
 *
 * `title` is required by the underlying component and is not decoration: it is both the tooltip text and
 * the accessible name, so a toolbar of icon-only buttons is still usable by anyone who cannot see the
 * icons. It defaults to the `text` property rather than to an empty string, so a button that has a
 * visible label is never left nameless.
 */
/**
 * A toolbar button. Its authored `destination` - a screen in an outlet, or a dialog - is executed by the
 * enclosing navigation host; outside one it is announced with the host-neutral `cratis.scene.navigate` event.
 * Interactions attached by the document run first.
 */
export function SceneToolbarButton({ element, interactions }: RegisteredComponentProps) {
    const text = stringProperty(element.properties, 'text');
    const navigation = useContext(SceneNavigationContextInternal);
    const destination = isDestination(element.properties.destination) ? element.properties.destination : undefined;
    const onClick = () => {
        interactions?.onClick?.({ stopPropagation: () => undefined });
        if (!destination) return;
        if (navigation) navigation.navigate(destination);
        else globalThis.dispatchEvent(new CustomEvent('cratis.scene.navigate', { detail: { destination, element } }));
    };

    return (
        <ToolbarButton
            icon={stringProperty(element.properties, 'icon')}
            text={text}
            title={stringProperty(element.properties, 'title') ?? text ?? ''}
            active={booleanProperty(element.properties, 'active')}
            tooltipPosition={unionProperty(element.properties, 'tooltipPosition', tooltipPositions)}
            onClick={onClick}
        />
    );
}

function isDestination(value: unknown): value is DestinationReference {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    const candidate = value as Record<string, unknown>;
    return ['screen', 'module', 'route', 'dialog'].some(key => typeof candidate[key] === 'string');
}
