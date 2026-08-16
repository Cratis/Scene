// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BreadCrumb } from 'primereact/breadcrumb';
import { MenuItem as PrimeMenuItem } from 'primereact/menuitem';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { readOptionalString, readRecords, recordString } from './elementProperties';

/**
 * The trail above the content.
 *
 * PrimeReact's own `BreadCrumb` does the rendering rather than hand-written markup, because a breadcrumb
 * is an ordinary component with no layout-mode behavior at all - it looks the same in every one of the
 * eight modes. The shell only writes CSS where PrimeReact 10 genuinely has no answer, and this is not one
 * of those places.
 */
export function Breadcrumb({ element }: RegisteredComponentProps) {
    const home = readOptionalString(element, 'homeTargetScreen');
    const model = readRecords(element, 'items').map(
        (item): PrimeMenuItem => ({
            label: recordString(item, 'label'),
            url: recordString(item, 'targetScreen') ? `#/${recordString(item, 'targetScreen')}` : undefined,
        }),
    );

    return (
        <div data-scene-id={element.id}>
            <BreadCrumb model={model} home={home ? { icon: 'pi pi-home', url: `#/${home}` } : undefined} />
        </div>
    );
}
