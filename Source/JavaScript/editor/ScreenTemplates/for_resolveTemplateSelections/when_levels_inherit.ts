// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateLevel } from '../TemplateLevel';
import { aTemplateCatalog } from '../given/aTemplateCatalog';
import { aHierarchy } from '../given/aHierarchy';
import { resolveTemplateSelections } from '../resolveTemplateSelections';

describe('when levels inherit', () => {
    const catalog = aTemplateCatalog();

    describe('and the application has a default', () => {
        const { application, nodes } = resolveTemplateSelections('ModuleWorkspace', aHierarchy(), catalog);

        it('should report the default as chosen at the application', () => {
            application.isExplicit.should.be.true;
            application.reference!.id.should.equal('ModuleWorkspace');
        });

        it('should give every level the default', () => {
            [...nodes.values()].map(selection => selection.reference!.id).should.deep.equal(['ModuleWorkspace', 'ModuleWorkspace', 'ModuleWorkspace', 'ModuleWorkspace']);
        });

        it('should say the default is inherited from the application', () => {
            nodes.get('slice')!.inheritedFrom!.should.deep.equal({ level: TemplateLevel.Application, nodeId: undefined });
        });

        it('should not call an inherited template explicit', () => {
            nodes.get('feature')!.isExplicit.should.be.false;
        });
    });

    describe('and nothing is chosen anywhere', () => {
        const { nodes } = resolveTemplateSelections('', aHierarchy(), catalog);

        it('should leave every level without a template', () => {
            [...nodes.values()].every(selection => selection.reference === undefined).should.be.true;
        });
    });

    describe('and a level in the middle chose a template', () => {
        const { nodes } = resolveTemplateSelections('', aHierarchy({ module: 'ModuleWorkspace', feature: 'FeatureSection' }), catalog);

        it('should hand it to the levels below that did not choose', () => {
            nodes.get('slice')!.reference!.id.should.equal('FeatureSection');
        });

        it('should say which level it came from', () => {
            nodes.get('slice')!.inheritedFrom!.should.deep.equal({ level: TemplateLevel.Feature, nodeId: 'feature' });
        });
    });
});
