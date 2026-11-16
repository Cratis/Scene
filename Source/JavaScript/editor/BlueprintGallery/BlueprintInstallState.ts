// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Where a blueprint stands in the application's UI profile. */
export enum BlueprintInstallState {
    /** Not in the profile: on offer. */
    Available = 'available',

    /** In the profile for its templates (`templatePacks`): they appear in the template picker where they apply. */
    TemplatePack = 'templatePack',

    /** The shell of the profile (`shell`): its layouts and templates are the application's. */
    Shell = 'shell',

    /** In the profile only because another package requires it. */
    Required = 'required',
}
