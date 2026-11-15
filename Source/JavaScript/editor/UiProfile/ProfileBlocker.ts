// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProfileBlockerKind } from './ProfileBlockerKind';

/** One reason the draft cannot be applied, with what the user needs to fix it. */
export interface ProfileBlocker {
    /** What is wrong. */
    kind: ProfileBlockerKind;

    /** The package, layout, template, component or slot that is the problem. */
    subject: string;

    /** The other party: the package that depends on `subject`, the screen that uses it, or the required range. */
    detail?: string;

    /** A second detail, the version found for a conflict. */
    found?: string;
}
