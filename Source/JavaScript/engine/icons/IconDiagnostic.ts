// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconReference } from '@cratis/scene.model';

/**
 * What can be wrong with an icon library or an icon reference. Each is a distinct, reportable condition -
 * none of them is ever resolved by quietly substituting another icon.
 */
export type IconDiagnosticKind =
    /** The reference names a library that is not active in the profile. */
    | 'missing-library'
    /** The library is active but its catalog has no icon with the reference's key. */
    | 'missing-icon'
    /** The icon exists but not in the variant the reference asks for. */
    | 'missing-variant'
    /** The library is active but at a version a package that needs it does not accept. */
    | 'incompatible-version'
    /** The library is active but its catalog could not be loaded. */
    | 'catalog-unavailable';

/**
 * One finding about an icon library or reference, carrying enough to explain it to an author.
 */
export interface IconDiagnostic {
    /**
     * What kind of problem this is.
     */
    kind: IconDiagnosticKind;

    /**
     * The library the finding is about.
     */
    library: string;

    /**
     * A sentence an author can act on.
     */
    message: string;

    /**
     * The reference the finding is about, when it is about one reference rather than a whole library.
     */
    reference?: IconReference;
}
