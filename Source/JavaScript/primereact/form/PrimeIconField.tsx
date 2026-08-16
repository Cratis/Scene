// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:iconField` component - a field with an icon rendered inside it.
 *
 * Like {@link PrimeFloatLabel} this decorates a field rather than being one, so the field comes from the
 * `content` slot with a plain text input as the fallback.
 */
export function PrimeIconField({ element, slots }: RegisteredComponentProps) {
    return (
        <IconField data-scene-id={element.id} iconPosition={stringProperty(element, 'iconPosition', 'left') as 'left' | 'right'}>
            <InputIcon className={stringProperty(element, 'icon', 'pi pi-search')} />
            {slots.content?.length ? slots.content : <InputText placeholder={stringProperty(element, 'placeholder')} />}
        </IconField>
    );
}
