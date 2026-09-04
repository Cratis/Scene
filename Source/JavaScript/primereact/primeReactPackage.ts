// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';
import { primeReactComponents } from './primeReactComponents';
import { primeReactThemeNames, primeReactThemes } from './theme';

/**
 * The `PrimeReact` package's declaration - what a `ui profile` lists by name and what a
 * `PackageDependency` refers to.
 *
 * The component list is written out rather than derived from the registry, on purpose. A manifest is
 * read by Stage's build and Studio's design-time queries *without loading a single component*, so it has
 * to stand on its own as the statement of what this package offers. Keeping it as its own list is also
 * what gives `validatePackageBundle` something real to check: two independently maintained lists that
 * must agree, rather than one list compared against itself.
 */
export const primeReactPackageManifest: ScenePackage = {
    name: 'PrimeReact',
    version: '11.1.0',
    kind: PackageKind.ComponentLibrary,

    /**
     * PrimeReact's own components need nothing from Tailwind - they are skinned by the `--p-*` custom
     * properties the active `@primeuix/themes` preset emits. The dependency is here because *this
     * package's wrappers* use Tailwind utility classes
     * for the layout around them: the row a checkbox and its label sit on, the column a radio group
     * stacks into, the grid a summary lays its pairs out in. A profile that activates this package
     * without Tailwind renders those wrappers unstyled, so declaring it is what makes the profile picker
     * offer Tailwind alongside PrimeReact instead of leaving the gap to be discovered on screen.
     */
    dependencies: [{ name: 'Tailwind' }],

    components: [
        'inputText', 'inputTextarea', 'inputNumber', 'password', 'floatLabel', 'iconField', 'dropdown', 'multiSelect',
        'listBox', 'selectButton', 'checkbox', 'radioButton', 'toggleSwitch', 'slider', 'rating', 'knob', 'calendar', 'colorPicker',
        'chips', 'autoComplete', 'treeSelect', 'button', 'splitButton', 'speedDial', 'buttonGroup', 'dataTable', 'table',
        'column', 'dataView', 'tree', 'timeline', 'paginator', 'orderList', 'pickList', 'organizationChart',
        'card', 'panel', 'accordion', 'fieldset', 'divider', 'splitter', 'scrollPanel', 'tabView', 'toolbar', 'stepper', 'dialog',
        'confirmDialog', 'overlayPanel', 'sidebar', 'tooltip', 'menu', 'menubar', 'breadcrumb', 'tabMenu', 'steps', 'tieredMenu',
        'panelMenu', 'contextMenu', 'megaMenu', 'dock', 'message', 'inlineMessage', 'toast', 'image', 'galleria', 'carousel', 'avatar',
        'badge', 'chip', 'tag', 'progressBar', 'progressSpinner', 'skeleton', 'scrollTop', 'blockUI', 'inplace', 'terminal', 'text',
        'title', 'field', 'section', 'summary', 'action',
    ],

    /**
     * Empty, and it stays empty. A layout is an application's base navigational look - one per
     * application - and choosing it is a decision about the product, not about which widgets are
     * available. A component library supplies the vocabulary a layout is built *from*; a
     * {@link PackageKind.Blueprint} package supplies the layout itself.
     */
    layouts: [],

    /**
     * Empty for the same reason `layouts` is. A screen template is a reusable page shape at module,
     * feature or slice level - "list with filters and a detail pane" - and it is composed *out of* the
     * names declared above. Shipping one here would mean this package had opinions about how a screen is
     * arranged, which is a Blueprint's job and not a component library's.
     */
    screenTemplates: [],

    /**
     * Empty, as above: a dialog template is a reusable dialog shape, composed from these components by a
     * Blueprint package rather than provided by the library the components come from.
     */
    dialogTemplates: [],

    themes: primeReactThemeNames,

    displayName: 'PrimeReact',
    description: 'PrimeReact 11 components and PrimeTek\'s @primeuix/themes presets, mapped onto Scene\'s abstract component names.',
    module: '@cratis/scene.primereact',
    // PrimeReact 11 is PrimeTek's commercial PrimeUI, not MIT as version 10 was. The Community
    // tier is free for eligible projects but still requires a key, so an author selecting this
    // package needs to see the terms before they select it, not after a banner appears.
    license: 'PrimeUI Community / Commercial',
    licenseUrl: 'https://primeui.dev/licenses/community',
};

/**
 * The `PrimeReact` package as a loadable bundle - the manifest plus the React components and themes
 * behind the names it declares.
 */
export const primeReactPackage: ScenePackageBundle = {
    manifest: primeReactPackageManifest,
    components: primeReactComponents,
    themes: primeReactThemes,
};
