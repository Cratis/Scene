// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { composeTemplateChain } from '../composeTemplateChain';
import { aTemplateCatalog } from '../given/aTemplateCatalog';
import { aHierarchy } from '../given/aHierarchy';
import { resolveTemplateSelections } from '../resolveTemplateSelections';

describe('when folding the chain of templates in effect', () => {
    const catalog = aTemplateCatalog([{ id: '00000000-0000-4000-8000-000000000123', name: 'Main' }]);
    const compose = (choices: Parameters<typeof aHierarchy>[0], level = 'slice') =>
        composeTemplateChain(resolveTemplateSelections('', aHierarchy(choices), catalog).nodes.get(level)!, catalog);

    it('should place the inner templates in the slots of the outer ones', () => {
        const folded = compose({ module: 'ModuleWorkspace', feature: 'FeatureSection', slice: 'SliceSection' })!;
        folded.name.should.equal('ModuleWorkspace');
        folded.content!.body!.length.should.be.greaterThan(0);
    });

    it('should fold an inheriting level to the same template as the level it inherits from', () => {
        compose({ module: 'ModuleWorkspace', feature: 'FeatureSection' }, 'subFeature')!.should.deep.equal(compose({ module: 'ModuleWorkspace', feature: 'FeatureSection' }, 'feature'));
    });

    it('should leave a single template as it is', () => {
        compose({ module: 'ModuleWorkspace' })!.should.equal(catalog.blueprint.find(candidate => candidate.reference.id === 'ModuleWorkspace')!.template);
    });

    it('should fold nothing when no blueprint template is in effect', () => {
        (compose({ module: '00000000-0000-4000-8000-000000000123' }) === undefined).should.be.true;
    });

    it('should fold what is left when a template in the chain is missing', () => {
        compose({ module: 'ModuleWorkspace', feature: 'Gone' })!.name.should.equal('ModuleWorkspace');
    });
});
