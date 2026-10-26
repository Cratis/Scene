// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingNullBehavior, BindingSourceKind } from '@cratis/scene.model';
import { resolveBindingExpression } from '../resolveBindingExpression';

describe('when a response has no continuation scope', () => {
    for (const nullBehavior of [undefined, BindingNullBehavior.Clear, BindingNullBehavior.Preserve]) {
        it(`should not resolve a command response from ordinary data or null behavior ${nullBehavior}`, () => {
            expect(resolveBindingExpression({ kind: BindingSourceKind.CommandResponse, path: 'id', nullBehavior }, { dataContext: { id: 'not-a-response' } })).toBeUndefined();
        });
    }
});
