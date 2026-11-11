// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardCondition, GuardOperator } from '@cratis/scene.model';
import { describeGuardCondition } from '../guards';

// Pins the TypeScript runtime's escaping; the C# engine writes \u0022 instead (a divergence outside the shared corpus).
describe('when describing a text holding a double quote', () => {
    const condition = { kind: 'comparison', left: { subject: 'item.a' }, operator: GuardOperator.Equal, right: 'a"b' } as GuardCondition;

    it('should escape the quote with a backslash', () => {
        expect(describeGuardCondition(condition)).toBe('item.a == "a\\"b"');
    });
});
