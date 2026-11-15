// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataSelection } from '@cratis/scene.model';
import { SampleDataSelectionSettings, noSampleData } from './SampleDataSelectionSettings';
import { UiProfileSettings } from './UiProfileSettings';

/**
 * The sample data choice of settings, which a profile stored before sample data existed does not have.
 *
 * @param settings The settings.
 * @returns The choice; generated data when none was made.
 */
export const sampleDataOf = (settings: Pick<UiProfileSettings, 'sampleData'>): SampleDataSelectionSettings => settings.sampleData === undefined ? noSampleData : settings.sampleData.bindings === undefined ? { ...settings.sampleData, bindings: [] } : settings.sampleData;

/**
 * Whether two sample data choices are the same.
 *
 * @param left The first choice.
 * @param right The second choice.
 * @returns `true` when the same pack is active with the same mappings and bindings, whatever their order.
 */
export const areSampleDataEqual = (left: SampleDataSelectionSettings, right: SampleDataSelectionSettings): boolean => {
    const key = (selection: SampleDataSelectionSettings) => [...selection.mappings].map(mapping => `${mapping.shape}=>${mapping.readModel}`).sort().join('\n');
    const bindingKey = (selection: SampleDataSelectionSettings) => [...(selection.bindings ?? [])].map(binding => `${binding.target}=>${binding.pack}`).sort().join('\n');
    return left.activePack === right.activePack && key(left) === key(right) && bindingKey(left) === bindingKey(right);
};

/**
 * The Scene `sampleData` of a profile for a choice: what Stage, the CLI and the screen editor read to resolve the data, so Studio
 * keeps no separate notion of it. Nothing is returned for the generated data with no mappings or bindings - the profile then has no `sampleData`
 * at all, as one declared without it has.
 *
 * @param selection The choice.
 * @returns The Scene selection, or `undefined` when the choice declares nothing.
 */
export const toSceneSampleData = (selection: SampleDataSelectionSettings | undefined): SampleDataSelection | undefined =>
    selection === undefined || (selection.activePack === '' && selection.mappings.length === 0 && (selection.bindings ?? []).length === 0)
        ? undefined
        : { ...(selection.activePack === '' ? {} : { activePack: selection.activePack }), mappings: selection.mappings.map(mapping => ({ ...mapping })), bindings: (selection.bindings ?? []).map(binding => ({ ...binding })) };
