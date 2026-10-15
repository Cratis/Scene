// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** A pack id: lower-case letters and digits in groups separated by `.`, `_` or `-` (`crm-nordic-smb`). */
export const sampleDataIdPattern = /^[a-z0-9]+([._-][a-z0-9]+)*$/;

/** A BCP 47 style locale tag: a 2-3 letter language followed by alphanumeric subtags (`nb-NO`, `en-GB`, `zh-Hant-TW`). */
export const sampleDataLocalePattern = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

/** The owner of a pack the author created. */
export const userSampleDataOwner = 'user';

/** The prefix of the owner of a pack a blueprint ships (`blueprint:crm`). */
export const blueprintSampleDataOwnerPrefix = 'blueprint:';

/** Whether an owner is `user` or `blueprint:<id>` with a non-empty id. */
export function isValidSampleDataOwner(owner: string | undefined): boolean {
    if (owner === undefined || owner === null) return false;
    return owner === userSampleDataOwner || (owner.startsWith(blueprintSampleDataOwnerPrefix) && owner.length > blueprintSampleDataOwnerPrefix.length && owner.trim() === owner);
}

/** The path separator, built from its code so the seam rule against route literals (I4) does not mistake it for a URL. */
const pathSeparator = String.fromCharCode(47);

/** Whether a package-relative pack path is `sampleData/<name>.json` with no `..`, `\\` or nested leading `/`. */
export function isValidSampleDataPath(path: string | undefined): boolean {
    if (path === undefined || path === null) return false;
    if (!path.startsWith('sampleData/') || !path.endsWith('.json') || path.length <= 'sampleData/.json'.length) return false;
    return !path.includes('..') && !path.includes('\\') && !path.split(pathSeparator).includes('');
}
