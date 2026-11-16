// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BlueprintReferenceUse } from './BlueprintReferenceUse';

const baseVersion = /^(?:\^|~|>=|=)?\s*(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;

/**
 * What a template reference's version range says about the version it was chosen from: a reference created from an installed blueprint pins the caret
 * range of that version (`^4.50.0`), so the lowest version the range names is the one chosen from. A range that names no single base - `*`, `>=1 <3`,
 * an empty one - says nothing and returns undefined: such a reference accepts any version and is never behind.
 *
 * @param blueprint The blueprint package the reference names.
 * @param range The reference's `version`.
 * @returns The use to hand to the gallery, or undefined.
 */
export function referenceUseOfPin(blueprint: string, range: string | undefined): BlueprintReferenceUse | undefined {
    const match = range === undefined ? null : baseVersion.exec(range.trim());
    return match === null ? undefined : { package: blueprint, version: match[1], pin: range!.trim() };
}
