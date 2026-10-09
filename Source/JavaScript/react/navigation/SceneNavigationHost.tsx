// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useMemo, useState } from 'react';
import { BindingScope } from '@cratis/scene.engine';
import { DestinationKind, DestinationReference, SceneElement } from '@cratis/scene.model';
import { SceneElementView } from '../SceneElementView';
import { ComponentRegistry } from '../renderer';
import { SceneNavigationContextValue, SceneNavigationProvider } from './SceneNavigationContext';
import { resolveDestination } from './resolveDestination';

export interface SceneNavigationHostProps {
    screens: Record<string, SceneElement>;
    dialogs?: Record<string, SceneElement>;
    initialScreen: string;
    registry: ComponentRegistry;
    bindingScope?: BindingScope;
}

/**
 * Executes Scene destinations against an in-memory rendered hierarchy: screen routes replace outlets,
 * dialog destinations render dialog content, and external destinations only report their resolved action.
 */
export function SceneNavigationHost({ screens, dialogs = {}, initialScreen, registry, bindingScope = {} }: SceneNavigationHostProps) {
    const [currentScreen, setCurrentScreen] = useState(initialScreen);
    const [currentUrl, setCurrentUrl] = useState<string | undefined>(initialScreen);
    const [currentOutlet, setCurrentOutlet] = useState<string | undefined>();
    const [currentDialog, setCurrentDialog] = useState<string | undefined>();

    const navigate = useCallback((destination: DestinationReference) => {
        const resolution = resolveDestination(destination, bindingScope);
        if (resolution.kind === DestinationKind.Dialog) {
            setCurrentDialog(resolution.dialog);
            return resolution;
        }

        if (resolution.kind !== DestinationKind.External) {
            setCurrentScreen(destination.screen ?? destination.slice ?? currentScreen);
            setCurrentOutlet(resolution.outlet);
        }

        setCurrentUrl(resolution.url);
        return resolution;
    }, [bindingScope, currentScreen]);

    const value = useMemo<SceneNavigationContextValue>(() => ({
        currentScreen,
        currentUrl,
        currentOutlet,
        currentDialog,
        bindingScope,
        navigate,
        closeDialog: () => setCurrentDialog(undefined),
    }), [bindingScope, currentDialog, currentOutlet, currentScreen, currentUrl, navigate]);

    const screen = screens[currentScreen];
    const dialog = currentDialog ? dialogs[currentDialog] : undefined;

    return <SceneNavigationProvider value={value}>
        <div data-scene-outlet={currentOutlet ?? 'primary'} data-scene-url={currentUrl}>
            {screen && <SceneElementView element={screen} registry={registry} dataContext={bindingScope.dataContext} queryResults={bindingScope.queryResults} componentOutputs={bindingScope.componentOutputs} />}
        </div>
        {dialog && <div role='dialog' data-scene-dialog={currentDialog}>
            <SceneElementView element={dialog} registry={registry} dataContext={bindingScope.dataContext} queryResults={bindingScope.queryResults} componentOutputs={bindingScope.componentOutputs} />
        </div>}
    </SceneNavigationProvider>;
}
