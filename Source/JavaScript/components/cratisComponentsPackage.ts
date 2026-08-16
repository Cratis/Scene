// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';
import { cratisComponents, cratisComponentsPackageName } from './cratisComponents';

/**
 * The `Cratis.Components` package's declaration - what a profile gets when it lists this package.
 *
 * This is the concrete case the whole package-dependency mechanism exists for. `@cratis/components` is
 * not a self-contained library: every component in it is a wrapper over a PrimeReact widget, and its own
 * styling is a `--cratis-*` token layer (`@cratis/components/tokens`) plus the component stylesheets and
 * compiled Tailwind utilities in `@cratis/components/styles`. Activate it in a profile without PrimeReact
 * and nothing renders; activate it without Tailwind and everything renders unstyled. Both are stated as
 * dependencies so a package picker can say so while the profile is being configured, instead of leaving
 * it to be discovered when the page opens.
 *
 * The version ranges are the real ones the library carries. `>=11.0.0` for PrimeReact: version 3.0.0
 * declares `primereact@^11` as a peer dependency and is built against version 11's component set, so the
 * span across the major boundary that the previous `>=10.9.0` range described is over. The `--cratis-*`
 * tokens still resolve a version 10 theme variable as their last fallback, but that is an upgrade-window
 * courtesy for an application with a compiled version 10 stylesheet still on the page - not a version of
 * PrimeReact this package can be activated against. `^4.0.0` for Tailwind, because the utility sheet is
 * compiled against Tailwind 4.
 */
export const cratisComponentsPackageManifest: ScenePackage = {
    name: cratisComponentsPackageName,
    version: '3.0.0',
    kind: PackageKind.ComponentLibrary,
    dependencies: [
        { name: 'PrimeReact', versionRange: '>=11.0.0' },
        { name: 'Tailwind', versionRange: '^4.0.0' },
    ],
    components: [
        'page',
        'dataPage',
        'formElement',
        'dataTable',
        'table',
        'observableDataTable',
        'commandForm',
        'inputTextField',
        'numberField',
        'checkboxField',
        'textAreaField',
        'dropdownField',
        'sliderField',
        'calendarField',
        'colorPickerField',
        'multiSelectField',
        'chipsField',
        'radioButtonField',
        'radioGroupField',
        'dialog',
        'confirmationDialog',
        'busyIndicatorDialog',
        'commandDialog',
        'stepperCommandDialog',
        'icon',
        'tooltip',
        'dropdown',
        'errorBoundary',
        'objectContentEditor',
        'objectNavigationalBar',
        'schemaEditor',
        'timeMachine',
        'filterPanel',
        'toolbar',
        'toolbarButton',
        'toolbarGroup',
        'toolbarSeparator',
    ],

    // A component library ships components, and nothing else. Layouts, screen templates and dialog
    // templates all belong to a Blueprint: they are decisions about what an application looks like as a
    // whole, and this package deliberately makes none of them - it provides the Arc-bound composites a
    // template is *built from*, so that a blueprint can place a `dataPage` in a slot and configure it,
    // rather than shipping one opinionated data page nobody can rearrange.
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],

    // No themes either, for a different reason: `@cratis/components` has no palette of its own. It reads
    // a `--cratis-*` variable layer that resolves whatever is in front of it - the `--p-*` properties a
    // PrimeReact 11 preset emits at runtime, or a Scene theme through this package's token bridge.
    // Shipping a theme here would be this library asserting a look it was specifically built not to have.
    themes: [],

    displayName: 'Cratis Components',
    description: "Cratis' Arc-bound data, form and dialog composites, built on PrimeReact and Tailwind.",
    module: '@cratis/scene.components',
};

/**
 * The `Cratis.Components` package as a loadable bundle - the manifest above, plus the React components
 * behind the names it declares.
 *
 * No `layouts`, `screenTemplates`, `dialogTemplates` or `themes` are provided, matching a manifest that
 * declares none of them; `validatePackageBundle` is what proves the two halves agree.
 */
export const cratisComponentsPackage: ScenePackageBundle = {
    manifest: cratisComponentsPackageManifest,
    components: cratisComponents,
};
