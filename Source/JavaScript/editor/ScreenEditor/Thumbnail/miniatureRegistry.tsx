// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, type ComponentType } from 'react';
import { ErrorBoundary } from '@cratis/components/Common';
import type { ComponentRegistry, RegisteredComponentProps } from '@cratis/scene.react';
import { overlayKinds } from '../Surface/DesignTime/overlayKinds';
import { bareNameOf, declarationComponents, withSampleProperties } from '../Surface/DesignTime/designTimeSamples';
import { designTimeDataComponents } from '../Surface/DesignTime/designTimeDataComponents';

// What a miniature draws nothing for: a declaration says something about the screen and has nothing to show, and an overlay opens something over the
// page - a window, a toast, a mask - which a miniature must never do, because what it opens is drawn at the page's size and not the miniature's.
export const drawsNothingInAMiniature = (componentName: string): boolean => {
    const bare = bareNameOf(componentName);
    return declarationComponents.has(bare) || bare in overlayKinds;
};

const withSampleContent = (registryKey: string, Component: ComponentType<RegisteredComponentProps>): ComponentType<RegisteredComponentProps> => {
    const Miniature = (props: RegisteredComponentProps) => {
        const nothing = drawsNothingInAMiniature(props.element.componentName);
        const element = useMemo(
            () => ({ ...props.element, properties: withSampleProperties(registryKey, props.element.componentName, props.element.properties) }),
            [props.element]);

        if (nothing) return null;

        // A component that cannot be drawn leaves its place empty; it never takes the rest of the miniature, or the board, with it.
        return <ErrorBoundary fallback={null}><Component {...props} element={element} /></ErrorBoundary>;
    };
    Miniature.displayName = `Miniature(${Component.displayName ?? Component.name ?? 'Component'})`;
    return Miniature;
};

// The registry a miniature of a screen draws with: the runtime's own, with each component given the sample content the editor's surface gives
// it where the screen sets none, and a screenplay table and summary drawn with the surface's sample rows and values - so the miniature shows the screen as
// the person saw it while editing, not as a button with no words or labels with no values. It adds nothing else of the surface: no selection box, no stand-in
// for a component that draws nothing, no note about sample content. The runtime's registry is left as it is; Play draws from it.
export function miniatureRegistry(registry: ComponentRegistry): ComponentRegistry {
    const withData = { ...registry, ...designTimeDataComponents(registry) };
    return Object.fromEntries(Object.entries(withData).map(([key, component]) => [key, withSampleContent(key, component)]));
}
