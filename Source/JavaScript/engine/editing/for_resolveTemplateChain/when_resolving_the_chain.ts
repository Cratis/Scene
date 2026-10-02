// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, EditingScopeKind } from '@cratis/scene.model';
import { resolveTemplateChain } from '../index';
import { createSceneDocument, scopeOf } from '../given/a_scene_document';

describe('when resolving the chain', () => {
    const document = createSceneDocument();
    const owners = (kind: EditingScopeKind, name: string) => resolveTemplateChain(document, scopeOf(kind, name, 'Shell')).levels.map(level => level.instance);

    it('should run from the layout through each template to the screen', () => {
        owners(EditingScopeKind.Screen, 'Invoices').should.deep.equal(['layout:Shell', 'template:Module', 'template:Feature', 'screen:Invoices']);
    });

    it('should end a template scope at the template', () => {
        owners(EditingScopeKind.ScreenTemplate, 'Feature').should.deep.equal(['layout:Shell', 'template:Module', 'template:Feature']);
    });

    it('should be the layout alone for a layout scope', () => {
        owners(EditingScopeKind.Layout, 'Shell').should.deep.equal(['layout:Shell']);
    });

    it('should find the components each level owns', () => {
        const chain = resolveTemplateChain(document, scopeOf(EditingScopeKind.Screen, 'Invoices'));
        chain.levels.map(level => level.elements.map(element => element.id)).should.deep.equal([[], ['navbar'], [], ['invoiceTable']]);
    });

    it('should report a scope that does not exist', () => {
        const chain = resolveTemplateChain(document, scopeOf(EditingScopeKind.Screen, 'Nope'));
        chain.levels.should.be.empty;
        chain.diagnostics.map(diagnostic => diagnostic.code).should.deep.equal([DiagnosticCode.UnknownScope]);
    });

    it('should read the layout of a template from a lone layout without being told', () => {
        owners(EditingScopeKind.ScreenTemplate, 'Module').should.deep.equal(['layout:Shell', 'template:Module']);
    });
});
