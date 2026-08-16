// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Page } from '@cratis/components/Common';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `Cratis.Components:page` component - `Page` from `@cratis/components/Common`.
 *
 * The library's page primitive rather than a plain `div`, because it is what every other component in
 * the library is laid out inside: a full-height flex column whose optional `panel` chrome is drawn from
 * the same `--cratis-*` tokens as the tables and dialogs it contains. A screen that wraps its content in
 * this gets that consistency for free; one that wraps it in a `div` has to reinvent it and will drift.
 *
 * Imported statically - `Page` is one of the library's Arc-free components, so it costs a screen nothing
 * to use it without an Arc runtime present.
 */
export function ScenePage({ element, slots }: RegisteredComponentProps) {
    return (
        <Page
            data-scene-id={element.id}
            title={stringProperty(element.properties, 'title') ?? ''}
            showTitle={booleanProperty(element.properties, 'showTitle')}
            panel={booleanProperty(element.properties, 'panel')}
        >
            {slots.content}
        </Page>
    );
}
