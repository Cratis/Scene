// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyDescriptor, QueryBinding, QueryCandidate, SceneDiagnostic } from '@cratis/scene.model';
import { validateBinding, type BindingTypeScope } from '@cratis/scene.engine';

// What to do with a binding the author has just changed.
export interface SettledBinding {
    diagnostics: SceneDiagnostic[];

    // Whether Scene would accept it as it is. A binding with problems is held as a draft, not stored.
    isStorable: boolean;
}

// Scene refuses to store a binding that does not hold together - a required parameter with nothing feeding it, a column
// the query does not return. An author builds a binding in steps (choose the query, then map its parameters), so the
// editor keeps the unfinished binding as a draft, tells the author what is still missing, and stores it the moment it
// is complete.
export function settleBinding(descriptor: PropertyDescriptor, candidate: QueryCandidate | undefined, binding: QueryBinding, scope: BindingTypeScope): SettledBinding {
    const diagnostics = validateBinding(descriptor, candidate, binding, scope);
    return { diagnostics, isStorable: diagnostics.every(diagnostic => diagnostic.severity !== 'error') };
}
