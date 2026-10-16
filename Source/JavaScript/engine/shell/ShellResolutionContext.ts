// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Screen, Theme } from '@cratis/scene.model';
import { TemplateLibrary } from '../templates/TemplateLibrary';

/** What the effective shell is resolved against. */
export interface ShellResolutionContext {
    /** The application's own templates and the blueprints that are available. */
    library: TemplateLibrary;

    /** The application's screens. When given, content placed in an outlet the shell lacks is reported. */
    screens?: readonly Screen[];

    /** The themes known to the host. When given, the profile's theme is checked against its packages. */
    themes?: readonly Theme[];

    /** The names of every package that is available. When given, packages of the profile that are not in it are reported. */
    availablePackages?: readonly string[];
}
