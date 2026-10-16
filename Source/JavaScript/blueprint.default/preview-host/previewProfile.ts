// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { UiProfile } from '@cratis/scene.model';
import type { PackageCatalog } from '@cratis/scene.engine';
import { ComponentName } from '../ComponentName';
import { defaultBlueprintName } from '../packageName';
import { coreComponents } from '@cratis/scene.react';

/** The packages every preview and Stage application resolves bare component names against, in ascending priority. */
export const requiredPackages = ['core', defaultBlueprintName];

/** What the packages every host has declare, so a bare name resolves to the package that provides it. */
export const blueprintPackageCatalog: PackageCatalog = {
    core: Object.keys(coreComponents).map(key => key.slice(key.indexOf(':') + 1)),
    [defaultBlueprintName]: Object.values(ComponentName),
};

/**
 * The profile an application renders against: the document's own web profile (else its first), with the packages every host
 * renders with admitted even when the model never named them - without that, a template written against the blueprint's
 * vocabulary would come out as a column of dashed placeholders. A host with more packages (PrimeReact, a custom set) lists them
 * in `additionalPackages`.
 *
 * The profile's `sampleData` is carried through: it is where the application chose its active pack (spec 11, SD3).
 *
 * @param profiles The profiles the document declares.
 * @param additionalPackages Packages the host renders with beyond the required ones, lowest priority first.
 * @returns The profile to resolve component names with.
 */
export function previewProfile(profiles: UiProfile[] | undefined, additionalPackages: string[] = []): UiProfile {
    const declared = profiles?.find(profile => profile.targetPlatform === 'web') ?? profiles?.[0];
    const packages = [...(declared?.packages ?? [])];
    for (const required of [...requiredPackages, ...additionalPackages]) {
        if (!packages.includes(required)) packages.push(required);
    }

    return {
        name: declared?.name ?? 'Preview',
        targetPlatform: declared?.targetPlatform ?? 'web',
        packages,
        defaultSizeClass: declared?.defaultSizeClass,
        layout: declared?.layout,
        theme: declared?.theme,
        sampleData: declared?.sampleData,
        root: declared?.root,
        appearance: declared?.appearance,
        defaults: declared?.defaults,
    };
}
