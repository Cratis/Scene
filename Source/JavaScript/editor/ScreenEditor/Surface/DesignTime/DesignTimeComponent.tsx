// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement, useMemo, useRef, useState, type ComponentType } from 'react';
import { ErrorBoundary } from '@cratis/components/Common';
import type { RegisteredComponentProps } from '@cratis/scene.react';
import { OverlayPreview } from './OverlayPreview';
import { defaultBlueprintName } from '@cratis/scene.blueprint.default';
import { EditorLogoBox } from '../../DesignMode/Navigation/EditorLogoContext';
import { overlayKinds } from './overlayKinds';
import { bareNameOf, declarationComponents, sampleKeysInUse, withSampleProperties } from './designTimeSamples';
import { DesignTimePlaceholder } from './DesignTimePlaceholder';
import { DesignTimePlaceholderTone } from './DesignTimePlaceholderTone';
import type { SurfaceStrings } from './SurfaceStrings';
import { useRendersVisibleContent } from './useRendersVisibleContent';

const nameOf = ({ element }: RegisteredComponentProps): string => element.name || element.componentName;

// The element changing is what an author does to fix a component that failed, so a failed component is retried whenever its
// element changes. Only a failed one: a component that draws fine keeps its tree. Scene hands down a new element object every
// time the screen's binding outputs change, and remounting a healthy component then clears its outputs on unmount, which
// changes the outputs again - a loop that took the editor down on any template with nested components.
const useRetryGeneration = (element: unknown, failed: boolean): number => {
    const seen = useRef(element);
    const generation = useRef(0);
    if (seen.current !== element) {
        seen.current = element;
        if (failed) generation.current += 1;
    }

    return generation.current;
};

// Draws a registered component for design time. It is drawn exactly as Play draws it, inside a box that takes no part in layout
// (`display: contents`), plus two things the editor needs that Play does not: a component that throws becomes a visible note
// instead of taking the whole surface down with it, and a component that draws nothing - a data declaration, a table with no query
// bound - gets a sized stand-in, so it can be seen, selected and dropped next to.
export function designTimeComponent(registryKey: string, Component: ComponentType<RegisteredComponentProps>, strings: SurfaceStrings, message?: ComponentType<RegisteredComponentProps>): ComponentType<RegisteredComponentProps> {
    const DesignTimeComponent = (props: RegisteredComponentProps) => {
        const probe = useRef<HTMLSpanElement>(null);
        const element = useMemo(
            () => ({ ...props.element, properties: withSampleProperties(registryKey, props.element.componentName, props.element.properties) }),
            [props.element]);
        const sampled = useMemo(() => sampleKeysInUse(registryKey, props.element.componentName, props.element.properties), [props.element]);
        const declaration = declarationComponents.has(bareNameOf(props.element.componentName));
        // The name decides it - except for the application shell of a blueprint, whose sidebar is the menu of the page, not a side sheet that opens over it.
        const blueprintPart = registryKey.startsWith(`${defaultBlueprintName}:`);
        const overlay = blueprintPart ? undefined : overlayKinds[bareNameOf(props.element.componentName)];
        // The strip of the application shell is laid out as one row, with the application's logo first, as the shell lays it out.
        const strip = blueprintPart && bareNameOf(props.element.componentName) === 'topbar';
        const [failure, setFailure] = useState<string>();
        const drawsSomething = useRendersVisibleContent(probe, props.element);
        const name = nameOf(props);
        const generation = useRetryGeneration(props.element, failure !== undefined);

        return (
            <span ref={probe} data-studio-element={props.element.id} style={{ display: 'contents' }} data-studio-sample={sampled.length > 0 ? sampled.join(' ') : undefined} title={sampled.length > 0 ? strings.sampleContent(sampled) : undefined}>
                <ErrorBoundary
                    key={generation}
                    onError={error => setFailure(error instanceof Error ? error.message : String(error))}
                    fallback={<DesignTimePlaceholder elementId={props.element.id} tone={DesignTimePlaceholderTone.Failed} text={strings.failedToDraw(name, failure ?? '')} />}>
                    {overlay
                        ? <OverlayPreview kind={overlay} tag={strings.overlay(name)} element={element} slots={props.slots} message={message} />
                        : strip
                            ? <div className='studio-design-topbar'><EditorLogoBox />{createElement(Component, { ...props, element })}</div>
                            : createElement(Component, { ...props, element })}
                </ErrorBoundary>
                {!drawsSomething && <DesignTimePlaceholder elementId={props.element.id} tone={declaration ? DesignTimePlaceholderTone.Declaration : DesignTimePlaceholderTone.Empty} text={declaration ? strings.declaration(name) : strings.nothingToShow(name)} />}
            </span>
        );
    };

    DesignTimeComponent.displayName = `DesignTime(${Component.displayName ?? Component.name ?? 'Component'})`;
    return DesignTimeComponent;
}
