// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext } from 'react';
import { RegisteredComponentProps } from '../renderer/ComponentRegistry';
import { SceneElementView } from '../SceneElementView';
import { SceneNavigationContextInternal } from './SceneNavigationContext';
import { useSceneSlots } from './SceneSlotContext';

/**
 * A nested slot a screen declares: `core:slot` with a `name`. Inside a navigation host it renders the
 * screen placed in that slot - which may declare slots of its own, so composition nests to any depth -
 * and nothing while the slot is empty. Outside a navigation host it renders the empty region. A `closable` slot - one the host
 * puts in a slot the shell declares - carries a `Close` button that empties it.
 */
export function CoreSlot({ element }: RegisteredComponentProps) {
    const closable = element.properties.closable === true;
    const name = typeof element.properties.name === 'string' ? element.properties.name : '';
    const navigation = useContext(SceneNavigationContextInternal);
    const slots = useSceneSlots();
    const placed = navigation?.slots[name];
    const screen = placed && slots ? slots.screens[placed] : undefined;

    return <div data-scene-slot={name} data-scene-slot-screen={placed}>
        {closable && placed && <div className='scene-slot-bar'>
            <button type='button' className='scene-slot-close' aria-label='Close' onClick={() => navigation?.closeSlot(name)}>Close</button>
        </div>}
        {screen && slots && <SceneElementView element={screen} registry={slots.registry}
            dataContext={navigation?.bindingScope.dataContext} queryResults={navigation?.bindingScope.queryResults} />}
    </div>;
}
