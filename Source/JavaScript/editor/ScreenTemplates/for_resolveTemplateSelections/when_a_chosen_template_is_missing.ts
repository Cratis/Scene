// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateDiagnosticKind } from '../TemplateDiagnosticKind';
import { aTemplateCatalog } from '../given/aTemplateCatalog';
import { aHierarchy } from '../given/aHierarchy';
import { resolveTemplateSelections } from '../resolveTemplateSelections';

describe('when a chosen template is missing', () => {
    const catalog = aTemplateCatalog();
    const { application, nodes } = resolveTemplateSelections('RemovedFromTheProfile', aHierarchy({
        module: 'ModuleWorkspace',
        feature: '00000000-0000-4000-8000-0000000000aa',
    }), catalog);

    it('should report a blueprint template nothing provides on the level that chose it', () => {
        application.diagnostics.map(diagnostic => diagnostic.kind).should.deep.equal([TemplateDiagnosticKind.Missing]);
    });

    it('should report an application template that was deleted on the level that chose it', () => {
        const diagnostic = nodes.get('feature')!.diagnostics[0];
        diagnostic.kind.should.equal(TemplateDiagnosticKind.Missing);
        diagnostic.reference.id.should.equal('00000000-0000-4000-8000-0000000000aa');
    });

    it('should keep the missing choice in effect instead of dropping it', () => {
        nodes.get('feature')!.reference!.id.should.equal('00000000-0000-4000-8000-0000000000aa');
        nodes.get('slice')!.reference!.id.should.equal('00000000-0000-4000-8000-0000000000aa');
    });

    it('should not blame a level that only inherits it', () => {
        nodes.get('slice')!.diagnostics.should.be.empty;
    });

    it('should report nothing on a level whose template exists', () => {
        nodes.get('module')!.diagnostics.should.be.empty;
    });
});
