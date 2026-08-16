// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { Chip } from 'primereact/chip';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:chip` component - a compact, optionally removable label.
 *
 * PrimeReact 11 replaced the `label` / `icon` / `image` / `removable` props with named parts, so the
 * adapter is what decides that an authored image wins over an authored icon and that both sit in the
 * leading `Start` slot. A screen can therefore only ever produce one leading adornment, which is the
 * whole point of a chip: a second one turns it into a toolbar.
 *
 * `Chip.Remove` carries the removal behavior itself - clicking it hides the chip through the component's
 * own state, so the adapter has nothing to wire. It renders a `span`, so the accessible name and button
 * role are supplied here rather than left to a screen that has no way to reach the part.
 */
export function PrimeChip({ element }: RegisteredComponentProps) {
    const label = stringProperty(element, 'label');
    const icon = stringProperty(element, 'icon');
    const image = stringProperty(element, 'image');

    let adornment: ReactNode;
    if (image !== undefined) adornment = <img src={image} alt='' className='h-full w-full rounded-full object-cover' />;
    else if (icon !== undefined) adornment = <i className={icon} aria-hidden='true' />;

    return (
        <Chip.Root data-scene-id={element.id}>
            {adornment !== undefined && <Chip.Start>{adornment}</Chip.Start>}
            <Chip.Label>{label}</Chip.Label>
            {booleanProperty(element, 'removable', false) && (
                <Chip.Remove role='button' aria-label={label === undefined ? 'Remove' : `Remove ${label}`}>
                    <i className='pi pi-times-circle' aria-hidden='true' />
                </Chip.Remove>
            )}
        </Chip.Root>
    );
}
