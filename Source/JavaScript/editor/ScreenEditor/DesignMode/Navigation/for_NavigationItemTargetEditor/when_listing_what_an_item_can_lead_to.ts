// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { rowsOf } from '../../../PropertyEditors/Specific/NavigationItemTargetEditor';
import { structure } from '../given/applicationNavigation';

const rows = rowsOf(structure);

describe('when listing what a navigation item can lead to', () => {
    it('should list each module followed by its features, indented', () => rows.map(row => `${'  '.repeat(row.depth)}${row.label}`).slice(0, 7).should.deep.equal(['Dashboard', '  Overview', 'Sales', '  Orders', '  Customers', '  Pipeline', 'Support']));
    it('should lead a module to the module alone, which opens its first feature', () => rows[0].target.should.deep.equal({ module: 'dashboard' }));
    it('should lead a feature to the module and the feature inside it', () => rows[3].target.should.deep.equal({ module: 'sales', feature: 'orders' }));
    it('should mark the modules', () => rows.filter(row => row.module).map(row => row.label).should.deep.equal(['Dashboard', 'Sales', 'Support']));
});
