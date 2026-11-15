// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { sampleDataIdPattern } from '@cratis/scene.engine';

/**
 * An identifier for a new own pack, made from its title: lower-case words joined by dashes. When the title yields nothing
 * Scene accepts, or the identifier is taken, a number is added.
 *
 * @param title What the user called the pack.
 * @param taken The identifiers already in use.
 * @returns An identifier Scene accepts.
 */
export function sampleDataPackId(title: string, taken: readonly string[]): string {
    const slug = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const base = sampleDataIdPattern.test(slug) ? slug : 'data-set';
    if (!taken.includes(base)) return base;
    let counter = 2;
    while (taken.includes(`${base}-${counter}`)) counter++;
    return `${base}-${counter}`;
}
