// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarButton } from '@cratis/components/Toolbar';
import { RegisteredComponentProps } from '@cratis/scene.react';
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
export function SceneToolbarButton({ element }: RegisteredComponentProps) {
    const text = stringProperty(element.properties, 'text');

    return (
        <ToolbarButton
            icon={stringProperty(element.properties, 'icon')}
            text={text}
            title={stringProperty(element.properties, 'title') ?? text ?? ''}
            active={booleanProperty(element.properties, 'active')}
            tooltipPosition={unionProperty(element.properties, 'tooltipPosition', tooltipPositions)}
        />
    );
}
