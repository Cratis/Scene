// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where in the chain an {@link OutletLevel} sits, from the top down: a layout or template declares outlets, a module,
 * feature, slice or screen refines them.
 */
export enum OutletLevelKind {
    /** A layout - the application's shell. */
    Layout = 'layout',

    /** A screen or dialog template. */
    Template = 'template',

    /** A module. */
    Module = 'module',

    /** A feature or sub-feature. */
    Feature = 'feature',

    /** A slice. */
    Slice = 'slice',

    /** A screen. */
    Screen = 'screen',
}
