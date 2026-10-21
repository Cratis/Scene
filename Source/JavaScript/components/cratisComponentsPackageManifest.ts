// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { cratisComponentsPackageName } from './cratisComponents';

/**
 * The `Cratis.Components` package's declaration - what a profile gets when it lists this package.
 *
 * `@cratis/components` is built on React Aria Components, so it needs no component-library package beside it: its
 * own styling is a `--cratis-*` token layer (`@cratis/components/tokens`) plus the component stylesheets and
 * compiled Tailwind utilities in `@cratis/components/styles`. Activate it without Tailwind and everything
 * renders unstyled, so that is stated as a dependency, letting a package picker say so while the profile is
 * being configured instead of leaving it to be discovered when the page opens. `^4.0.0` for Tailwind, because
 * the utility sheet is compiled against Tailwind 4.
 *
 * PrimeReact is not a dependency. A profile that wants PrimeReact widgets lists the optional `PrimeReact`
 * package (`@cratis/scene.primereact`) itself.
 */
export const cratisComponentsPackageManifest: ScenePackage = {
    name: cratisComponentsPackageName,
    version: '3.0.0',
    kind: PackageKind.ComponentLibrary,
    dependencies: [
        { name: 'Tailwind', versionRange: '^4.0.0' },
    ],
    components: [
        'page',
        'dataPage',
        'formElement',
        'singleResult',
        'queryInputForm',
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
    // a `--cratis-*` variable layer that resolves whatever is in front of it - the tokens of an
    // optional widget package's preset, or a Scene theme through this package's token bridge.
    // Shipping a theme here would be this library asserting a look it was specifically built not to have.
    themes: [],

    displayName: 'Cratis Components',
    description: "Cratis' Arc-bound data, form and dialog composites, built on React Aria and Tailwind. dataTable and table accept optional object-valued queryArguments for collection queries. singleResult displays one read-only scalar own resultField of an optional model using an explicit query, object queryArguments and enabled: true. queryInputForm commits explicit string inputs on submit to the same optional-single runtime; drafts never execute a query.",
    module: '@cratis/scene.components',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    designTime: {
        previews: [],
        designers: ['commandFormDesigner'],
        // `commandFields` and `fieldWidths` are host editor kinds (Studio implements them); the package does not ship them.
        propertyEditors: ['commandBinding', 'commandFormLayout'],
        propertyDisplays: [],
        actions: ['Cratis.Components.commandForm.generateFields'],
    },
    assets: ['@cratis/components/styles', '@cratis/components/tokens'],
    runtimeSingletons: ['react', '@cratis/arc', '@cratis/components'],
};
