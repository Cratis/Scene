// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Where the template browser is hosted, which decides what it offers. */
export enum TemplateBrowserMode {
    /** The page of the Screen Templates node: everything is listed, with the reasons a template does not fit a target, and the application's own templates can be managed. */
    Manage = 'manage',

    /** A dialog opened from a template picker: only what applies to the target is listed (spec TPL2 - hidden, not disabled), and choosing a template closes it. */
    Pick = 'pick',
}
