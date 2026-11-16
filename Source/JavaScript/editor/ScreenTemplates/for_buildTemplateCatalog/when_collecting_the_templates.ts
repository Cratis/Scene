// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceKind } from '../TemplateReferenceKind';
import { aTemplateCatalog } from '../given/aTemplateCatalog';

describe('when collecting the templates of an application', () => {
    const catalog = aTemplateCatalog([{ id: '00000000-0000-4000-8000-000000000123', name: 'Main' }]);

    it('should use the layout of the shell', () => {
        catalog.layout!.name.should.equal('AppShell');
    });

    it('should offer the templates the profile\'s blueprints provide', () => {
        catalog.blueprint.map(candidate => candidate.reference.id).should.include.members(['ModuleWorkspace', 'FeatureSection', 'SliceSection']);
    });

    it('should name each blueprint template after the package that provides it', () => {
        catalog.blueprint.find(candidate => candidate.reference.id === 'ModuleWorkspace')!.source.should.not.be.empty;
    });

    it('should offer the application\'s own templates by identifier', () => {
        catalog.application.should.deep.equal([{
            reference: { kind: TemplateReferenceKind.Application, id: '00000000-0000-4000-8000-000000000123' },
            displayName: 'Main',
            source: '',
        }]);
    });
});
