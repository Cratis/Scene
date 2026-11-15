// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ActionModel } from './ActionModel';
import { sliceNamedBy, type StateChangeSlice } from './StateChangeSlice';

export enum ActionProblemKind {
    MissingSlice = 'missingSlice',
    UnmappedInput = 'unmappedInput',
    UnknownInput = 'unknownInput',
    UnknownSource = 'unknownSource',
}

export interface ActionProblem {
    kind: ActionProblemKind;
    input?: string;
}

// What no longer holds for an action: the slice it submits is gone, an input the command needs has nothing feeding
// it, an input is mapped that the command does not have, or a value comes from somewhere the screen does not offer.
export function diagnoseAction(model: ActionModel, slices: readonly StateChangeSlice[], availableSources: ReadonlySet<string>): ActionProblem[] {
    const slice = sliceNamedBy(slices, model.sliceId);
    if (!slice) return [{ kind: ActionProblemKind.MissingSlice }];

    const problems: ActionProblem[] = [];
    for (const input of slice.inputs) {
        const source = model.inputs[input.name]?.trim();
        if (!source) {
            if (input.required) problems.push({ kind: ActionProblemKind.UnmappedInput, input: input.name });
        } else if (!availableSources.has(source)) {
            problems.push({ kind: ActionProblemKind.UnknownSource, input: input.name });
        }
    }

    for (const name of Object.keys(model.inputs)) {
        if (!slice.inputs.some(input => input.name === name)) problems.push({ kind: ActionProblemKind.UnknownInput, input: name });
    }

    return problems;
}

// A starting mapping for a slice: each input that has a same-named value available is wired to it, the rest are left for the author.
export function suggestInputs(slice: StateChangeSlice, sourceFor: (inputName: string) => string | undefined): Record<string, string> {
    return Object.fromEntries(slice.inputs.flatMap(input => {
        const source = sourceFor(input.name);
        return source === undefined ? [] : [[input.name, source]];
    }));
}
