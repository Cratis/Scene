// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement, Theme } from '@cratis/scene.model';
import { ComponentRegistry, SceneElementView } from '@cratis/scene.react';
import type { BindingResolver } from '@cratis/scene.engine';
import { LayoutThemeProvider } from '@cratis/scene.blueprint.default';
import '@cratis/scene.blueprint.default/styles.css';
import '@cratis/scene.primereact/primeReactTheme.css';
import '@cratis/scene.components/styles';
import './BlueprintScreenStage.css';

export interface BlueprintScreenStageProps {
    /** The composed screen, with every component name already resolved to a registry key. */
    element?: SceneElement;

    /** The merged registry of every loaded package. */
    registry: ComponentRegistry;

    /** The themes the shell's own configurator may switch between. */
    themes: Theme[];

    /** Shown instead of the screen when none is chosen. */
    emptyMessage: string;

    /** Answers the data a screen binds to; nothing is bound when absent. */
    resolveBinding?: BindingResolver;
}

/**
 * Where the selected gallery screen actually renders.
 *
 * Nothing here is a preview-only rendering path: the tree is a real `Screen` composed by the blueprint's
 * own `composeScreenElement`, its names are resolved by the real `resolveComponentName`, and it is drawn
 * by the real `SceneElementView` against the merged registry - the identical renderer Stage ships. The
 * only thing Studio adds is the box it happens to be inside.
 *
 * The three stylesheets are the ones that make a Scene theme actually reach the components: the
 * blueprint's own layout rules, PrimeReact's token bridge, and Cratis Components'. Without them the shell
 * lays out but every widget keeps whatever the host application's PrimeReact theme happened to be, and
 * switching Scene themes appears to do nothing.
 */
export function BlueprintScreenStage({ element, registry, themes, emptyMessage, resolveBinding = () => undefined }: BlueprintScreenStageProps) {
    if (!element) {
        return <div className='studio-blueprint-stage studio-blueprint-stage--empty'>{emptyMessage}</div>;
    }

    return (
        <div className='studio-blueprint-stage'>
            <LayoutThemeProvider themes={themes} className='studio-blueprint-stage__theme'>
                <SceneElementView element={element} registry={registry} resolveBinding={resolveBinding} />
            </LayoutThemeProvider>
        </div>
    );
}
