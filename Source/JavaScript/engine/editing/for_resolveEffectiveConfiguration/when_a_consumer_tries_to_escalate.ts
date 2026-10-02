// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation, DiagnosticCode, EditingScopeKind } from '@cratis/scene.model';
import { computeExposureGrants, resolveTemplateChain } from '../index';
import { catalog, createExposedDocument, createReExposedDocument, scopeOf } from '../given/a_scene_document';
import { codes, items, resolve, scalar, valueOf } from './given/resolution';

describe('when a consumer tries to escalate', () => {
    it('should ignore a screen contribution the nested template did not re-expose', () => {
        const document = createExposedDocument();
        document.instanceContributions.push(scalar('screen:Invoices', 'title', 'Sneaky'));
        const configuration = resolve(document, EditingScopeKind.Screen, 'Invoices');

        (valueOf(configuration, 'navbar', 'title')!.value as string).should.equal('Menu');
        codes(configuration).should.deep.equal([DiagnosticCode.ContributionNotExposed]);
    });

    it('should ignore a contribution to a property that was never exposed', () => {
        const document = createExposedDocument();
        document.instanceContributions.push(scalar('template:Feature', 'density', 'compact'));
        const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');

        codes(configuration).should.deep.equal([DiagnosticCode.ContributionNotExposed]);
        (configuration.components[0].properties.density === undefined).should.be.true;
    });

    it('should ignore items when adding is not exposed', () => {
        const document = createReExposedDocument();
        document.exposures[0].properties[0].operations = [CollectionOperation.Remove];
        document.exposures[1].properties[0].operations = [];
        document.instanceContributions.push(items('screen:Invoices', { id: 'x', values: { label: 'X' } }));
        const configuration = resolve(document, EditingScopeKind.Screen, 'Invoices');

        valueOf(configuration, 'navbar', 'items')!.items!.map(item => item.id).should.deep.equal(['home']);
        codes(configuration).should.include(DiagnosticCode.ContributionOperationNotPermitted);
    });

    it('should drop a field that is not exposed for editing', () => {
        const document = createReExposedDocument();
        document.exposures[0].properties[0].editableFields = ['label'];
        document.instanceContributions.push(items('template:Feature', { id: 'x', values: { label: 'X', destination: { screen: 'Elsewhere' } } }));
        const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');

        valueOf(configuration, 'navbar', 'items')!.items![1].values.should.deep.equal({ label: 'X' });
        codes(configuration).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
    });

    it('should never let a re-exposure grant more than the owner did', () => {
        const document = createReExposedDocument();
        document.exposures[0].properties[0].operations = [CollectionOperation.Add];
        document.exposures[1].properties[0].operations = [CollectionOperation.Add, CollectionOperation.Remove];

        const grants = computeExposureGrants(resolveTemplateChain(document, scopeOf(EditingScopeKind.Screen, 'Invoices')), catalog);
        grants.byInstance.get('screen:Invoices')!.values().next().value!.operations.should.deep.equal([CollectionOperation.Add]);
        grants.diagnostics.map(diagnostic => diagnostic.code).should.include(DiagnosticCode.ExposureWidensOwner);
    });

    it('should report a re-exposure of something the owner never exposed', () => {
        const document = createReExposedDocument();
        document.exposures[0].properties.pop();

        const configuration = resolve(document, EditingScopeKind.Screen, 'Invoices');
        codes(configuration).should.include(DiagnosticCode.ReExposureBroken);
    });

    it('should not let a duplicate item id replace the owner\'s item', () => {
        const document = createReExposedDocument();
        document.instanceContributions.push(items('template:Feature', { id: 'home', values: { label: 'Hijacked' } }));
        const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');

        valueOf(configuration, 'navbar', 'items')!.items!.map(item => item.values.label).should.deep.equal(['Home']);
        codes(configuration).should.deep.equal([DiagnosticCode.DuplicateCollectionItem]);
    });
});
