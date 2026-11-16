// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateDiagnosticKind } from '../TemplateDiagnosticKind';
import { aTemplateCatalog } from '../given/aTemplateCatalog';
import { aHierarchy } from '../given/aHierarchy';
import { resolveTemplateSelections } from '../resolveTemplateSelections';

describe('when a chosen template no longer fits what is above it', () => {
    const catalog = aTemplateCatalog();
    const { nodes } = resolveTemplateSelections('', aHierarchy({ module: 'Dashboard', feature: 'FeatureSection' }), catalog);

    it('should report it as incompatible on the level that chose it', () => {
        nodes.get('feature')!.diagnostics.map(diagnostic => diagnostic.kind).should.deep.equal([TemplateDiagnosticKind.Incompatible]);
    });

    it('should say what it was meant to go inside', () => {
        nodes.get('feature')!.diagnostics[0].container!.should.equal('Dashboard');
    });

    it('should keep the choice in effect', () => {
        nodes.get('feature')!.reference!.id.should.equal('FeatureSection');
    });

    it('should accept a template that fits', () => {
        resolveTemplateSelections('', aHierarchy({ module: 'ModuleWorkspace', feature: 'FeatureSection' }), catalog)
            .nodes.get('feature')!.diagnostics.should.be.empty;
    });

    it('should accept a choice that merely repeats the level above', () => {
        resolveTemplateSelections('', aHierarchy({ module: 'ModuleWorkspace', feature: 'ModuleWorkspace' }), catalog)
            .nodes.get('feature')!.diagnostics.should.be.empty;
    });
});
