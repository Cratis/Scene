// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { aTemplateCatalog } from '../given/aTemplateCatalog';
import { aHierarchy } from '../given/aHierarchy';
import { resolveTemplateSelections } from '../resolveTemplateSelections';

describe('when resetting a level to inherited', () => {
    const catalog = aTemplateCatalog();
    const overridden = resolveTemplateSelections('', aHierarchy({ module: 'ModuleWorkspace', feature: 'FeatureSection' }), catalog);
    const reset = resolveTemplateSelections('', aHierarchy({ module: 'ModuleWorkspace' }), catalog);

    it('should have been overriding before', () => {
        overridden.nodes.get('feature')!.isExplicit.should.be.true;
    });

    it('should take the template of the level above afterwards', () => {
        reset.nodes.get('feature')!.reference!.id.should.equal('ModuleWorkspace');
    });

    it('should no longer be explicit', () => {
        reset.nodes.get('feature')!.isExplicit.should.be.false;
    });
});
