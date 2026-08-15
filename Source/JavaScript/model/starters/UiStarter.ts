// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A packaged, versioned UI starting point: a package list, the themes it ships compatible with, and a
 * gallery of ordinary screens shipped alongside it - part of Cratis/Scene#6. A starter is data, not a
 * `.play` language construct; Studio's "new project" flow scaffolds from it, and its gallery boots
 * through the real `Scene.Engine` + `Scene.React` inside a sandboxed `UiProfile` built from `packages` -
 * there is no separate preview pipeline and no mocked screens.
 */
export interface UiStarter {
    name: string;
    packages: string[];
    themes: string[];
    gallery: string[];
}

export const UiStarterPropertyNames: (keyof UiStarter)[] = ['name', 'packages', 'themes', 'gallery'];
