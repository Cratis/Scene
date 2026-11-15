// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FreeformArrangement, HeightSizeClass, SizeClass, WidthSizeClass } from '@cratis/scene.model';
import { findMissingVariants } from '../findMissingVariants';

describe('when finding missing variants', () => {
    let result: SizeClass[];

    beforeEach(() => {
        const arrangement: FreeformArrangement = {
            variants: [
                { sizeClass: { width: WidthSizeClass.Compact, height: HeightSizeClass.Regular }, placements: [] },
            ],
        };

        const targetSizeClasses: SizeClass[] = [
            { width: WidthSizeClass.Compact, height: HeightSizeClass.Regular },
            { width: WidthSizeClass.Regular, height: HeightSizeClass.Regular },
        ];

        result = findMissingVariants(arrangement, targetSizeClasses);
    });

    it('should not report a size class with a matching variant', () => {
        result.some(sizeClass => sizeClass.width === WidthSizeClass.Compact).should.be.false;
    });

    it('should report a target size class with no matching variant', () => {
        result.should.deep.equal([{ width: WidthSizeClass.Regular, height: HeightSizeClass.Regular }]);
    });
});
