// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext } from 'react';
import { RegisteredComponentProps } from '../renderer/ComponentRegistry';
import { SceneElementView } from '../SceneElementView';
import { SceneNavigationContextInternal } from './SceneNavigationContext';
import { useSceneOutlets } from './SceneOutletContext';

/**
 * A nested outlet a screen declares: `core:outlet` with a `name`. Inside a navigation host it renders the
 * screen placed in that outlet - which may declare outlets of its own, so composition nests to any depth -
 * and nothing while the outlet is empty. Outside a navigation host it renders the empty region.
 */
export function CoreOutlet({ element }: RegisteredComponentProps) {
    const name = typeof element.properties.name === 'string' ? element.properties.name : '';
    const navigation = useContext(SceneNavigationContextInternal);
    const outlets = useSceneOutlets();
    const placed = navigation?.outlets[name];
    const screen = placed && outlets ? outlets.screens[placed] : undefined;

    return <div data-scene-outlet={name} data-scene-outlet-screen={placed}>
        {screen && outlets && <SceneElementView element={screen} registry={outlets.registry}
            dataContext={navigation?.bindingScope.dataContext} queryResults={navigation?.bindingScope.queryResults} />}
    </div>;
}
