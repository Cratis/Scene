// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { formatMessage } from '../UiProfile/formatMessage';
import { IconPropertyFieldStrings } from './IconPropertyFieldStrings';
import { IconValueProblem } from './IconValueProblem';

// The sentence that explains an icon problem and how to repair it.
export function describeIconValueProblem(problem: IconValueProblem, strings: IconPropertyFieldStrings): string {
    const template = problem.diagnostic ? strings.diagnostics[problem.diagnostic.kind] : strings.notAllowed;
    return formatMessage(template, { library: problem.reference.library, key: problem.reference.key, variant: problem.reference.variant });
}
