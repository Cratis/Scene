// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataBinding, SampleDataMapping, SampleDataPack } from '@cratis/scene.model';
import { findSampleDataSet, validateSampleDataSelection, type SampleDataCatalog } from '@cratis/scene.engine';
import { formatMessage } from '../../UiProfile/formatMessage';
import { isScreenplayIdentifier } from '../../UiProfile/isScreenplayIdentifier';
import { sampleDataOf } from '../../UiProfile/sampleDataOf';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import type { ProfileProblem } from '../Problems/ProfileProblem';
import { ProfileNodeKind } from '../Structure/ProfileNodeKind';
import type { ProfileSampleDataInput } from './ProfileSampleData';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

/** The sentences the binding problems are said with. */
export type SampleDataProblemText = Pick<UiProfileDesignerStrings['problems'], 'sampleDataBindingInvalidReadModel' | 'sampleDataBindingUnknownReadModel' | 'sampleDataBindingNoData'>;

/** What the binding problems are judged against: the words to say them with. The read models come from the workspace, when the host lists them. */
export type SampleDataBindingContext = SampleDataProblemText;

// What Scene says is wrong with the profile's sample data choice (an unknown pack, a mapping to nothing), as problems on the Sample data node. The rule is
// Scene's `validateSampleDataSelection`; this only gives it the packs that exist and names the node. What Scene cannot know is added here: a bound read model
// that is not a Screenplay identifier cannot be exported (an error), one the application does not have is stale, and an own pack without data for it supplies none
// (both warnings, since the read models are only known when the host lists them).
export function findSampleDataProblems(
    settings: Pick<UiProfileSettings, 'sampleData'>,
    workspace: Pick<ProfileSampleDataInput, 'packs' | 'readModels'> | undefined,
    catalog: SampleDataCatalog,
    text: SampleDataBindingContext
): ProfileProblem[] {
    const ownPacks = workspace?.packs ?? [];
    const readModels = workspace?.readModels ?? [];
    const selection = sampleDataOf(settings);
    const known: SampleDataPack[] = [
        ...ownPacks,
        ...catalog.blueprints.flatMap(group => group.packs).map((pack): SampleDataPack => ({ id: pack.id, title: pack.name, locale: pack.locale ?? '', owner: 'blueprint', sets: [] })),
    ];
    const scene = validateSampleDataSelection({ activePack: selection.activePack || undefined, mappings: selection.mappings, bindings: selection.bindings }, known)
        .map(message => ({ code: 'sampleDataInvalid', severity: 'error' as const, message, node: ProfileNodeKind.SampleData }));
    const bindings = selection.bindings.flatMap(binding => findBindingProblems(binding, selection.mappings, { ownPacks, readModels }, text));
    return [...scene, ...bindings];
}

// What cannot be exported or served for one binding: a name that is not a Screenplay identifier (an error, and the only finding then), a read model the
// application does not have, and an own pack that holds no data for the read model.
function findBindingProblems(binding: SampleDataBinding, mappings: SampleDataMapping[], { ownPacks, readModels }: { ownPacks: readonly SampleDataPack[]; readModels: readonly string[] }, text: SampleDataBindingContext): ProfileProblem[] {
    const subject = { readModel: binding.target, pack: binding.pack };
    const problem = (code: string, severity: 'error' | 'warning', message: string): ProfileProblem => ({ code, severity, message: formatMessage(message, subject), node: ProfileNodeKind.SampleData });
    if (!isScreenplayIdentifier(binding.target)) return [problem('sampleDataBindingInvalidReadModel', 'error', text.sampleDataBindingInvalidReadModel)];
    const found: ProfileProblem[] = [];
    if (readModels.length > 0 && !readModels.includes(binding.target)) found.push(problem('sampleDataBindingUnknownReadModel', 'warning', text.sampleDataBindingUnknownReadModel));
    const own = ownPacks.find(pack => pack.id === binding.pack);
    if (own !== undefined && findSampleDataSet(own, binding.target, mappings) === undefined) found.push(problem('sampleDataBindingNoData', 'warning', text.sampleDataBindingNoData));
    return found;
}
