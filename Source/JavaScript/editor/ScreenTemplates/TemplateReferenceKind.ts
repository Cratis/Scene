// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Where a chosen screen template comes from. */
export enum TemplateReferenceKind {
    /** A screen template a Scene package in the UI Profile contributes, identified by its name. */
    Blueprint = 'blueprint',

    /** A screen template built for the application itself, identified by its identifier. */
    Application = 'application',
}
