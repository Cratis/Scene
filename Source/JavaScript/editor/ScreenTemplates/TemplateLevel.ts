// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** A position in the hierarchy a screen template can be chosen at. Each level inherits from the one above it. */
export enum TemplateLevel {
    /** The application, whose optional default is set on the UI Profile page. */
    Application = 'application',

    /** A module of the application. */
    Module = 'module',

    /** A feature of a module. */
    Feature = 'feature',

    /** A feature nested in another feature. */
    SubFeature = 'subFeature',

    /** A slice of a feature. */
    Slice = 'slice',
}
