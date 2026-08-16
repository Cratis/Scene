// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconField } from 'primereact/iconfield';
import { InputText } from 'primereact/inputtext';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:iconField` component - a field with an icon rendered inside it.
 *
 * Like {@link PrimeFloatLabel} this decorates a field rather than being one, so the field comes from the
 * `content` slot with a plain text input as the fallback.
 *
 * PrimeReact 11 has no `primereact/inputicon` module; the icon slot is `IconField.Inset`, a part of
 * `iconfield` itself. With it went the `iconPosition` prop - v11 gives the root a single class and reads
 * the side off the DOM instead - so `iconPosition` is honored here by placing the inset before or after
 * the field rather than by naming a side. Same authored property, same result, decided one level up.
 */
export function PrimeIconField({ element, slots }: RegisteredComponentProps) {
    const icon = <IconField.Inset className={stringProperty(element, 'icon', 'pi pi-search')} />;
    const field = slots.content?.length ? slots.content : <InputText placeholder={stringProperty(element, 'placeholder')} />;
    const iconLast = stringProperty(element, 'iconPosition', 'left') === 'right';
    return (
        <IconField.Root data-scene-id={element.id}>
            {iconLast ? field : icon}
            {iconLast ? icon : field}
        </IconField.Root>
    );
}
