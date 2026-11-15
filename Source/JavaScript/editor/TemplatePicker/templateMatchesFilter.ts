// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicableTemplate } from '@cratis/scene.engine';

/**
 * Whether a template matches what was typed into the picker's filter: its name, description, category or blueprint,
 * ignoring case. A blank filter matches everything.
 *
 * @param template The template.
 * @param blueprint The blueprint it comes from, or `undefined` for an own template.
 * @param filter What was typed.
 * @returns Whether it matches.
 */
export function templateMatchesFilter(template: ApplicableTemplate, blueprint: string | undefined, filter: string): boolean {
    const needle = filter.trim().toLocaleLowerCase();
    if (needle.length === 0) return true;
    return [template.displayName, template.name, template.description, template.metadata?.category, template.metadata?.type, blueprint]
        .some(value => value?.toLocaleLowerCase().includes(needle));
}
