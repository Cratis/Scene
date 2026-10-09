// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormWidthUnit } from '@cratis/scene.model';
import { normalizeCommandFormLayout, parseFormWidth } from '../forms';

describe('when normalizing legacy geometry', () => {
    it('should use a one-column default without authored geometry', () => {
        const layout = normalizeCommandFormLayout(undefined, []);

        layout.columns.should.deep.equal([{ index: 1, width: { unit: FormWidthUnit.Fraction, value: 1 } }]);
        layout.placements.should.be.empty;
    });

    it('should migrate recognized width tokens and reject arbitrary strings', () => {
        const layout = normalizeCommandFormLayout(undefined, [{ property: 'name', column: 2, width: '2fr' }]);

        layout.placements[0].width!.should.deep.equal({ unit: FormWidthUnit.Fraction, value: 2 });
        (parseFormWidth('composeUsingCallback') === undefined).should.equal(true);
    });
});
