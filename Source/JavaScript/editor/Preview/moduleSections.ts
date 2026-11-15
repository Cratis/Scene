// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicationStructure, DestinationReference, SampleDataPack, Screen } from '@cratis/scene.model';

/** The query the workspace template's module navigation reads its sections from. */
export const moduleSectionsQuery = 'ModuleSections';

/** The identifier of the pack that carries the sections of the module being previewed. */
export const moduleSectionsPackId = 'studio-preview-module-sections';

/**
 * The sections of a module as Scene's sub-navigation reads them: one row, `{ id, label }`, for each feature of the module. A feature is what a module is
 * divided into on the board and in the navigation Stage draws; a screen is not, since a feature's screens are its page and its slices' tasks.
 *
 * @param structure The structure of the application.
 * @param sceneId The dotted scene identifier of the node the preview was started from; its first segment is the module.
 * @returns The rows, none when the module is not found or has no features.
 */
export function moduleSectionRowsOf(structure: ApplicationStructure | undefined, sceneId: string): Record<string, unknown>[] {
    const moduleName = sceneId.split('.')[0].toLowerCase();
    const module = structure?.modules.find(candidate => candidate.id.toLowerCase() === moduleName || candidate.name.toLowerCase() === moduleName);
    return (module?.features ?? []).map(feature => ({ id: feature.id, label: feature.name }));
}

/**
 * The pack that supplies the module navigation of the workspace template, so it does not draw "Nothing here yet". It stands behind every pack in effect:
 * the host asks it last, so a `ModuleSections` the author's own sample data carries is never overridden - and, since the model's own packs are asked,
 * none is made when the model or the application carries one.
 *
 * @param structure The structure of the application.
 * @param sceneId The dotted scene identifier of the node the preview was started from.
 * @param authorPacks The packs the model and the application carry.
 * @returns The pack, or `undefined` when there is nothing to supply.
 */
export function moduleSectionsPackOf(structure: ApplicationStructure | undefined, sceneId: string, authorPacks: readonly SampleDataPack[]): SampleDataPack | undefined {
    if (authorPacks.some(pack => (pack.sets ?? []).some(set => set.shape === moduleSectionsQuery))) return undefined;
    const rows = moduleSectionRowsOf(structure, sceneId);
    return rows.length === 0 ? undefined : { id: moduleSectionsPackId, title: 'Module sections', locale: 'en', owner: 'studio', sets: [{ shape: moduleSectionsQuery, rows }] };
}

// The module the preview shows after the shell navigated: the module of the screen it moved to, so the module navigation follows the module the user
// went to rather than staying on the one the preview started in. A dialog over the page, or a screen the document does not place, keeps the module.
export function moduleOfDestination(screens: readonly Screen[], destination: DestinationReference): string | undefined {
    if (destination.module) return destination.module;
    if (!destination.screen) return undefined;
    const screen = screens.find(candidate => candidate.name === destination.screen);
    return screen?.path?.[0] ?? screen?.owner?.split('.')[0];
}
