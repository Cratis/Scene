// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The categories a component picker groups components under. Every component declares exactly one (rule CMP1).
 *
 * The set is open: a package may declare a category of its own, which a validation reports as a warning
 * ({@link DiagnosticCode.ComponentCategoryUnknown}) rather than refusing, so a picker shows it as a group of its own.
 * Matching is by the exact words below.
 */
export const ComponentCategory = {
    /** Moves the user between places: topbar, sidebar, tabs, breadcrumbs, stepper. */
    Navigation: 'Navigation',

    /** Shows data: data table, list, card grid, board, timeline, stat card, chart. */
    DataDisplay: 'Data display',

    /** Takes a value from the user: text field, select, date picker, tag input, lookup. */
    Input: 'Input',

    /** Starts something: button, toolbar, menu, command bar. */
    Actions: 'Actions',

    /** Arranges other components: stack, grid, split pane, card, section. */
    Layout: 'Layout',

    /** Tells the user what happened or is happening: alert, toast, empty state, progress. */
    Feedback: 'Feedback',

    /** Appears over the page: dialog, side sheet, popover. */
    Overlay: 'Overlay',

    /** Collects a command's input: form, wizard, field group. */
    Forms: 'Forms',
} as const;

export type ComponentCategory = (typeof ComponentCategory)[keyof typeof ComponentCategory];

/** Every category this model defines, in the order a picker lists them. */
export const componentCategories: readonly string[] = Object.values(ComponentCategory);
