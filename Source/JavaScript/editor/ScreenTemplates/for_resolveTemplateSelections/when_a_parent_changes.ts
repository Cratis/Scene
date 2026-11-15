// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { aTemplateCatalog } from '../given/aTemplateCatalog';
import { aHierarchy } from '../given/aHierarchy';
import { resolveTemplateSelections } from '../resolveTemplateSelections';

describe('when a parent changes its template', () => {
    const catalog = aTemplateCatalog([{ id: '00000000-0000-4000-8000-000000000123', name: 'Main' }]);
    const before = resolveTemplateSelections('', aHierarchy({ module: 'ModuleWorkspace', slice: 'SliceSection' }), catalog);
    const after = resolveTemplateSelections('', aHierarchy({ module: '00000000-0000-4000-8000-000000000123', slice: 'SliceSection' }), catalog);

    it('should have the inheriting descendants follow', () => {
        before.nodes.get('feature')!.reference!.id.should.equal('ModuleWorkspace');
        after.nodes.get('feature')!.reference!.id.should.equal('00000000-0000-4000-8000-000000000123');
        after.nodes.get('subFeature')!.reference!.id.should.equal('00000000-0000-4000-8000-000000000123');
    });

    it('should leave the explicit override where it was', () => {
        after.nodes.get('slice')!.reference!.id.should.equal('SliceSection');
        after.nodes.get('slice')!.isExplicit.should.be.true;
    });
});
