// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentRegistry, componentRegistryKey } from '@cratis/scene.react';
import { SceneDataPage, SceneFormElement, ScenePage } from './pages';
import { SceneDataTable, SceneObservableDataTable } from './data';
import {
    SceneCalendarField,
    SceneCheckboxField,
    SceneChipsField,
    SceneColorPickerField,
    SceneCommandForm,
    SceneDropdownField,
    SceneInputTextField,
    SceneMultiSelectField,
    SceneNumberField,
    SceneRadioButtonField,
    SceneRadioGroupField,
    SceneSliderField,
    SceneTextAreaField,
} from './forms';
import { SceneBusyIndicatorDialog, SceneCommandDialog, SceneConfirmationDialog, SceneDialog, SceneStepperCommandDialog } from './dialogs';
import { SceneDropdown, SceneErrorBoundary, SceneIcon, SceneTooltip } from './common';
import { SceneFilterPanel, SceneObjectContentEditor, SceneObjectNavigationalBar, SceneSchemaEditor, SceneTimeMachine } from './editors';
import { SceneToolbar, SceneToolbarButton, SceneToolbarGroup, SceneToolbarSeparator } from './toolbar';

/**
 * The package name every component here is registered under, and the one a screen writes when it
 * qualifies a name explicitly (`Cratis.Components.table`).
 */
export const cratisComponentsPackageName = 'Cratis.Components';

/**
 * The `Cratis.Components` package's component registry - the abstract names a screen can resolve to a
 * real `@cratis/components` component.
 *
 * Names are `lowerCamelCase` and deliberately *abstract*: a screen names `dataTable`, not
 * `DataTableForQuery`, so the same screen resolves against whichever package a profile ranks highest.
 * Two of them - `table` and `dialog` - are names `core` and `PrimeReact` also declare, and that overlap
 * is the point: a profile listing `core`, `PrimeReact`, `Cratis.Components` in that order resolves both
 * here and records the others as shadowed, which is override priority doing exactly what it exists for.
 *
 * `table` and `dataTable` are the same component under two names. `dataTable` says what it is; `table`
 * is what a screen written against the base vocabulary already says, and both should land on the
 * query-aware implementation.
 */
export const cratisComponents: ComponentRegistry = {
    [componentRegistryKey(cratisComponentsPackageName, 'page')]: ScenePage,
    [componentRegistryKey(cratisComponentsPackageName, 'dataPage')]: SceneDataPage,
    [componentRegistryKey(cratisComponentsPackageName, 'formElement')]: SceneFormElement,

    [componentRegistryKey(cratisComponentsPackageName, 'dataTable')]: SceneDataTable,
    [componentRegistryKey(cratisComponentsPackageName, 'table')]: SceneDataTable,
    [componentRegistryKey(cratisComponentsPackageName, 'observableDataTable')]: SceneObservableDataTable,

    [componentRegistryKey(cratisComponentsPackageName, 'commandForm')]: SceneCommandForm,
    [componentRegistryKey(cratisComponentsPackageName, 'inputTextField')]: SceneInputTextField,
    [componentRegistryKey(cratisComponentsPackageName, 'numberField')]: SceneNumberField,
    [componentRegistryKey(cratisComponentsPackageName, 'checkboxField')]: SceneCheckboxField,
    [componentRegistryKey(cratisComponentsPackageName, 'textAreaField')]: SceneTextAreaField,
    [componentRegistryKey(cratisComponentsPackageName, 'dropdownField')]: SceneDropdownField,
    [componentRegistryKey(cratisComponentsPackageName, 'sliderField')]: SceneSliderField,
    [componentRegistryKey(cratisComponentsPackageName, 'calendarField')]: SceneCalendarField,
    [componentRegistryKey(cratisComponentsPackageName, 'colorPickerField')]: SceneColorPickerField,
    [componentRegistryKey(cratisComponentsPackageName, 'multiSelectField')]: SceneMultiSelectField,
    [componentRegistryKey(cratisComponentsPackageName, 'chipsField')]: SceneChipsField,
    [componentRegistryKey(cratisComponentsPackageName, 'radioButtonField')]: SceneRadioButtonField,
    [componentRegistryKey(cratisComponentsPackageName, 'radioGroupField')]: SceneRadioGroupField,

    [componentRegistryKey(cratisComponentsPackageName, 'dialog')]: SceneDialog,
    [componentRegistryKey(cratisComponentsPackageName, 'confirmationDialog')]: SceneConfirmationDialog,
    [componentRegistryKey(cratisComponentsPackageName, 'busyIndicatorDialog')]: SceneBusyIndicatorDialog,
    [componentRegistryKey(cratisComponentsPackageName, 'commandDialog')]: SceneCommandDialog,
    [componentRegistryKey(cratisComponentsPackageName, 'stepperCommandDialog')]: SceneStepperCommandDialog,

    [componentRegistryKey(cratisComponentsPackageName, 'icon')]: SceneIcon,
    [componentRegistryKey(cratisComponentsPackageName, 'tooltip')]: SceneTooltip,
    [componentRegistryKey(cratisComponentsPackageName, 'dropdown')]: SceneDropdown,
    [componentRegistryKey(cratisComponentsPackageName, 'errorBoundary')]: SceneErrorBoundary,

    [componentRegistryKey(cratisComponentsPackageName, 'objectContentEditor')]: SceneObjectContentEditor,
    [componentRegistryKey(cratisComponentsPackageName, 'objectNavigationalBar')]: SceneObjectNavigationalBar,
    [componentRegistryKey(cratisComponentsPackageName, 'schemaEditor')]: SceneSchemaEditor,
    [componentRegistryKey(cratisComponentsPackageName, 'timeMachine')]: SceneTimeMachine,
    [componentRegistryKey(cratisComponentsPackageName, 'filterPanel')]: SceneFilterPanel,

    [componentRegistryKey(cratisComponentsPackageName, 'toolbar')]: SceneToolbar,
    [componentRegistryKey(cratisComponentsPackageName, 'toolbarButton')]: SceneToolbarButton,
    [componentRegistryKey(cratisComponentsPackageName, 'toolbarGroup')]: SceneToolbarGroup,
    [componentRegistryKey(cratisComponentsPackageName, 'toolbarSeparator')]: SceneToolbarSeparator,
};
