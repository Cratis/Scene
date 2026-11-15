// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ElementRect, findSceneElementRect } from '../useElementRect';

describe('when the element does not exist', () => {
    let result: ElementRect | undefined;

    beforeEach(() => {
        const container = { querySelector: () => null } as unknown as HTMLElement;
        result = findSceneElementRect(container, 'missing');
    });

    it('should return undefined', () => {
        (result === undefined).should.be.true;
    });
});
