// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { RegisteredComponentProps } from '../renderer/ComponentRegistry';
import { OutletView } from './OutletView';
import { outletOfElement } from './outletOfElement';
import { useSceneOutlets } from './SceneOutletsContext';

/**
 * The `core:outletItems` component: draws the items of an outlet where a template or screen places it - Screenplay's
 * `outlet toolbar of actions` drawn in the header slot.
 *
 * Properties: `name` names the outlet. Inside a page that declares it (`SceneOutletsProvider`), the component draws what
 * the page's chain resolves - defaults, what modules, features and screens extend, override, hide and contribute. On its
 * own it draws the outlet it declares itself: `kind`, `subject`, `slot` and `items` (the defaults). `item` is what an
 * outlet of actions `for item` acts on, usually bound to a table's selected row.
 */
export function CoreOutletItems({ element }: RegisteredComponentProps) {
    const context = useSceneOutlets();
    const outlet = useMemo(() => outletOfElement(element.id, element.properties, context), [context, element.id, element.properties]);
    if (!outlet) return <div data-scene-id={element.id} data-scene-outlet-unresolved={String(element.properties.name ?? '')} />;
    return <OutletView outlet={outlet} item={element.properties.item} elementId={element.id} />;
}
