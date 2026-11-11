// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { parseGuardCondition } from '../guards';

// Pins the TypeScript runtime's serialization; the C# engine keeps the sign (-0) in its raw output (a divergence outside the shared corpus).
describe('when parsing a negative zero', () => {
    const result = parseGuardCondition('item.a == -0');

    it('should read a negative zero', () => {
        expect(Object.is(result && result.kind === 'comparison' ? result.right : undefined, -0)).toBe(true);
    });

    it('should serialize it without the sign', () => {
        expect(JSON.stringify(result)).toContain('"right":0}');
    });
});
