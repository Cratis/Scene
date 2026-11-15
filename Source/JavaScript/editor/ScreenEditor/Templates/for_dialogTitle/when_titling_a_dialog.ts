// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Screen } from '@cratis/scene.model';
import { dialogTitleOf } from '../dialogTitle';

describe('when titling a dialog', () => {
    it('should say what its form does', () => dialogTitleOf({ forms: [{ name: 'Form', forCommand: 'DescribeProduct', fields: [] }] } as unknown as Screen)!.should.equal('Describe product'));
    it('should have no title of its own without a form', () => (dialogTitleOf({ forms: [] } as unknown as Screen) === undefined).should.be.true);
});
