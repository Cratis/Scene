// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The component names the gallery expects the blueprint's dependencies to declare.
 *
 * A screen template names components by their **bare** name and lets `resolveComponentName` pick the
 * package, which is what makes a template portable across profiles. The cost is that a template can
 * reference a name no active package declares, and the only symptom is a dashed red placeholder in the
 * middle of a screen.
 *
 * These lists are that assumption, written down. The specs resolve every name a gallery template
 * references against a catalog built from them plus this blueprint's own manifest, so a template that
 * reaches for something outside the agreed vocabulary fails a spec rather than a preview. When PrimeReact
 * and Cratis Components publish their real manifests, the specs should be pointed at those and these lists
 * deleted - at which point any name that was wrong shows up immediately.
 */

/** Names assumed to come from the `PrimeReact` package - PrimeReact 10 component names, lowerCamelCased. */
export const assumedPrimeReactComponents: string[] = [
    'avatar',
    'calendar',
    'chart',
    'checkbox',
    'column',
    'dataTable',
    'divider',
    'dropdown',
    'fileUpload',
    'image',
    'inputNumber',
    'inputText',
    'inputTextarea',
    'message',
    'panel',
    'password',
    'progressBar',
    'steps',
    'tag',
    'timeline',
];

/** Names assumed to come from the `Cratis.Components` package. */
export const assumedCratisComponents: string[] = ['dataPage', 'dataTableForObservableQuery', 'commandDialog', 'dialog'];

/** The names `core` guarantees, regardless of which packages a profile lists. */
export const coreComponentNames: string[] = ['text', 'button', 'card'];
