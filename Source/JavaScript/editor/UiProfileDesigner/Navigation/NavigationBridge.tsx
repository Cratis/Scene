// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect } from 'react';
import type { DestinationReference } from '@cratis/scene.model';
import { useSceneNavigation } from '@cratis/scene.react';

// How the canvas's own controls - the *Showing* picker, the peek bar's Back - drive the host's history. Rendered inside the host, it hands
// the host's navigation out; the host stays the only thing that navigates, and the page's own address is never touched.
export interface CanvasNavigation {
    navigate(destination: DestinationReference): void;
}

export interface NavigationBridgeProps {
    onReady(navigation: CanvasNavigation): void;
}

export const NavigationBridge = ({ onReady }: NavigationBridgeProps) => {
    const { navigate } = useSceneNavigation();
    useEffect(() => onReady({ navigate: destination => { navigate(destination); } }), [navigate, onReady]);
    return null;
};
