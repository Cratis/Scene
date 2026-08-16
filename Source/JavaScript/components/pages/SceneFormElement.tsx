// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormElement, IconDisplay } from '@cratis/components/Common';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `Cratis.Components:formElement` component - `FormElement` from `@cratis/components/Common`.
 *
 * Pairs an input with a leading icon addon so a row of unrelated inputs still lines up. The icon can be
 * given two ways, and both are worth supporting: the `icon` property for the common case of a PrimeIcons
 * class name, and an `icon` slot for a screen that wants a real component there. The slot wins when both
 * are present, since a slot is the more specific statement.
 */
export function SceneFormElement({ element, slots }: RegisteredComponentProps) {
    const icon = stringProperty(element.properties, 'icon');
    const iconContent = slots.icon?.length ? slots.icon : icon === undefined ? undefined : <IconDisplay icon={icon} />;

    return <FormElement icon={iconContent}>{slots.content}</FormElement>;
}
