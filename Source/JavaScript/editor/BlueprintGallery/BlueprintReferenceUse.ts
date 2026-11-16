// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A template reference of the application that pins a blueprint: the version of the blueprint it was chosen from, and the range it accepts.
 * The gallery compares each with the version it lists to say "update available" (Scene's `evaluateBlueprintPin`, the one rule both engines share).
 */
export interface BlueprintReferenceUse {
    /** The blueprint package the reference names. */
    package: string;

    /** The version of the blueprint the reference was chosen from. */
    version: string;

    /** The range the reference accepts; absent is the caret range of `version`. */
    pin?: string;
}
