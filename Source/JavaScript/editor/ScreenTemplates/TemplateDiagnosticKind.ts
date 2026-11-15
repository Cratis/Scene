// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What is wrong with a chosen template. */
export enum TemplateDiagnosticKind {
    /** Nothing provides the template any more: it was removed, renamed, or its blueprint left the UI Profile. */
    Missing = 'missing',

    /** The template exists but no longer fits what is above it, so it would not be placed when the screen is composed. */
    Incompatible = 'incompatible',
}
