// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The `Cratis.Components` names this blueprint's templates are built from.
 *
 * These are not this package's names - `Cratis.Components` declares every one of them, and this blueprint
 * only writes them into its templates. They are collected here anyway, for two reasons.
 *
 * The first is the ordinary one: a bare name written inline is a magic string, and a typo in it renders as
 * a dashed red box in the middle of a screen with nothing pointing back at the template that caused it.
 *
 * The second is what makes this worth an enum rather than a comment. A spec asserts that every member
 * below appears in `cratisComponentsPackageManifest.components`, so this file is a standing check that
 * this blueprint and the component library it is built from still agree. If a name is ever renamed
 * upstream, that spec fails here rather than a screen failing silently in someone's application.
 *
 * A screen template writes bare names on purpose: `resolveComponentName` decides which active package
 * wins each one against the profile's priority order, so a template that qualified its names would pin
 * itself to one library and stop being a template.
 */
export enum CompositeName {
    /** The library's page primitive - a full-height column whose optional panel chrome matches everything inside it. */
    Page = 'page',

    /** The whole list-screen composite: title bar, menubar, filterable table and optional details pane, all from one query. */
    DataPage = 'dataPage',

    /** A table that performs a query, pages against the server, and wires filtering and sorting back into it. */
    DataTable = 'dataTable',

    /** The live variant - an observable query, a WebSocket subscription, and a re-render when the read model changes. */
    ObservableDataTable = 'observableDataTable',

    /** A form generated from a command's own property descriptors, so it follows the command rather than going stale. */
    CommandForm = 'commandForm',

    /** A single-line text field bound to one command property. */
    InputTextField = 'inputTextField',

    /** A numeric field bound to one command property. */
    NumberField = 'numberField',

    /** A multi-line text field bound to one command property. */
    TextAreaField = 'textAreaField',

    /** A single-selection field over a list the screen carries inline. */
    DropdownField = 'dropdownField',

    /** A date field bound to one command property. */
    CalendarField = 'calendarField',

    /** The Arc-aware dialog, whose result resolves through Arc's dialog context rather than through `visible` state. */
    Dialog = 'dialog',

    /** A dialog whose confirm button *is* the command's execution - it submits, feeds validation back, and only closes on success. */
    CommandDialog = 'commandDialog',

    /** The blocking spinner shown while a long-running command is in flight. */
    BusyIndicatorDialog = 'busyIndicatorDialog',

    /** An icon, with the shorthand forms people actually write normalized into the class PrimeIcons expects. */
    Icon = 'icon',

    /** A standalone selection control, not bound to a command property. */
    Dropdown = 'dropdown',

    /** Scopes a failure to a region, so one broken widget does not take the screen with it. */
    ErrorBoundary = 'errorBoundary',

    /** Renders an arbitrary JSON document against its schema, with a control per declared type. */
    ObjectContentEditor = 'objectContentEditor',

    /** The trail that says where you are inside a nested document, and lets you climb back out. */
    ObjectNavigationalBar = 'objectNavigationalBar',

    /** Edits a JSON schema as a typed property tree rather than as text. */
    SchemaEditor = 'schemaEditor',

    /** Scrubs through successive versions of something on a timeline. */
    TimeMachine = 'timeMachine',

    /** The filter toggle and the panel it anchors, as one placeable element. */
    FilterPanel = 'filterPanel',

    /** The container for a tool palette, which also establishes the drag context its buttons read. */
    Toolbar = 'toolbar',

    /** One button in a tool palette. */
    ToolbarButton = 'toolbarButton',

    /** Related buttons kept together inside a toolbar. */
    ToolbarGroup = 'toolbarGroup',

    /** The divider between groups of tools. */
    ToolbarSeparator = 'toolbarSeparator',
}
