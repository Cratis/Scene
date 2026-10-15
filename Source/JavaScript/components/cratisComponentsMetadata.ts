// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory } from '@cratis/scene.model';
import { ComponentMetadata, componentMetadata as m, toolbarDesignMode } from '@cratis/scene.react';

/** The category, icon, keywords and picker badge of every component of the package (CMP1), keyed by bare component name. */
export const cratisComponentsMetadata: Record<string, ComponentMetadata> = {
    page: m('Page', ComponentCategory.Layout, 'panel-top', ['screen', 'view']),
    dataPage: m('Data page', ComponentCategory.DataDisplay, 'table-properties', ['page', 'query', 'table']),
    formElement: m('Form element', ComponentCategory.Forms, 'text-cursor-input', ['field', 'input']),
    singleResult: m('Single result', ComponentCategory.DataDisplay, 'file-text', ['detail', 'record', 'read model']),
    queryInputForm: m('Query input form', ComponentCategory.Forms, 'search', ['query', 'arguments', 'parameters']),
    dataTable: m('Data table', ComponentCategory.DataDisplay, 'table', ['grid', 'list', 'rows', 'table', 'query'], 'Tb'),
    table: m('Table', ComponentCategory.DataDisplay, 'table-2', ['grid', 'rows', 'list'], 'Tb'),
    observableDataTable: m('Observable data table', ComponentCategory.DataDisplay, 'radio', ['live', 'realtime', 'observable', 'grid'], 'Ot'),
    commandForm: m('Command form', ComponentCategory.Forms, 'square-pen', ['form', 'command', 'input'], 'Fm'),
    inputTextField: m('Text field', ComponentCategory.Input, 'text-cursor-input', ['text', 'input', 'string']),
    numberField: m('Number field', ComponentCategory.Input, 'hash', ['number', 'numeric', 'integer']),
    checkboxField: m('Checkbox field', ComponentCategory.Input, 'square-check', ['checkbox', 'boolean', 'toggle']),
    textAreaField: m('Text area field', ComponentCategory.Input, 'text-align-start', ['multiline', 'text', 'notes']),
    dropdownField: m('Dropdown field', ComponentCategory.Input, 'chevron-down', ['select', 'choice', 'list']),
    sliderField: m('Slider field', ComponentCategory.Input, 'sliders-horizontal', ['range', 'slider']),
    calendarField: m('Date field', ComponentCategory.Input, 'calendar', ['date picker', 'calendar', 'time']),
    colorPickerField: m('Color field', ComponentCategory.Input, 'palette', ['colour', 'picker']),
    multiSelectField: m('Multi-select field', ComponentCategory.Input, 'list-checks', ['multiple', 'select', 'choices']),
    chipsField: m('Tag input field', ComponentCategory.Input, 'tags', ['tags', 'chips', 'keywords'], 'Tg'),
    radioButtonField: m('Radio button field', ComponentCategory.Input, 'circle-dot', ['radio', 'option']),
    radioGroupField: m('Radio group field', ComponentCategory.Input, 'circle-dot-dashed', ['radio', 'options', 'choice']),
    dialog: m('Dialog', ComponentCategory.Overlay, 'app-window', ['modal', 'popup', 'window']),
    confirmationDialog: m('Confirmation dialog', ComponentCategory.Overlay, 'circle-question-mark', ['confirm', 'yes no', 'modal']),
    busyIndicatorDialog: m('Busy indicator dialog', ComponentCategory.Overlay, 'loader', ['loading', 'wait', 'progress']),
    commandDialog: m('Command dialog', ComponentCategory.Overlay, 'square-pen', ['command', 'form', 'modal']),
    stepperCommandDialog: m('Stepper command dialog', ComponentCategory.Forms, 'list-ordered', ['wizard', 'steps', 'command']),
    icon: m('Icon', ComponentCategory.DataDisplay, 'star', ['glyph', 'symbol']),
    tooltip: m('Tooltip', ComponentCategory.Overlay, 'message-square', ['hint', 'hover', 'help']),
    dropdown: m('Dropdown', ComponentCategory.Input, 'chevrons-up-down', ['select', 'choice', 'combo']),
    errorBoundary: m('Error boundary', ComponentCategory.Feedback, 'triangle-alert', ['error', 'failure', 'fallback']),
    objectContentEditor: m('Object content editor', ComponentCategory.Input, 'braces', ['json', 'object', 'editor']),
    objectNavigationalBar: m('Object navigation bar', ComponentCategory.Navigation, 'navigation', ['breadcrumb', 'object', 'path']),
    schemaEditor: m('Schema editor', ComponentCategory.Input, 'file-braces', ['json schema', 'schema', 'editor']),
    timeMachine: m('Time machine', ComponentCategory.DataDisplay, 'rotate-ccw-clock', ['history', 'events', 'replay']),
    filterPanel: m('Filter panel', ComponentCategory.Input, 'funnel', ['filter', 'search', 'refine']),
    toolbar: m('Toolbar', ComponentCategory.Actions, 'wrench', ['actions', 'buttons', 'command bar'], 'Tl', toolbarDesignMode()),
    toolbarButton: m('Toolbar button', ComponentCategory.Actions, 'mouse-pointer-click', ['button', 'action']),
    toolbarGroup: m('Toolbar group', ComponentCategory.Actions, 'group', ['group', 'buttons']),
    toolbarSeparator: m('Toolbar separator', ComponentCategory.Actions, 'minus', ['divider', 'separator']),
};
