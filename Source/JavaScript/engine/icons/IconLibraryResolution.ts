// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconDiagnostic } from './IconDiagnostic';
import { ResolvedIconLibrary } from './ResolvedIconLibrary';

/**
 * The icon libraries a set of packages makes active, and what is wrong with them.
 */
export interface IconLibraryResolution {
    /**
     * Every active icon library - selected or required transitively - in the dependency order of
     * {@link resolvePackageDependencies}. Order carries no precedence: libraries coexist, and the library
     * is part of every icon's identity.
     */
    libraries: ResolvedIconLibrary[];

    /**
     * Problems with the libraries themselves, such as a version a dependent does not accept.
     */
    diagnostics: IconDiagnostic[];
}
