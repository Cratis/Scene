// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation, DiagnosticCode, EditingScopeKind, ValueSource } from '@cratis/scene.model';
import { createReExposedDocument } from '../given/a_scene_document';
import { codes, items, resolve, valueOf } from './given/resolution';

describe('when an instance replaces the owner items', () => {
    it('should leave only its own items when replacing is exposed', () => {
        const document = createReExposedDocument();
        document.exposures[0].properties[0].operations = [CollectionOperation.Add, CollectionOperation.Replace];
        document.exposures[1].properties[0].operations = [CollectionOperation.Add, CollectionOperation.Replace];
        document.instanceContributions.push({ ...items('template:Feature', { id: 'mine', values: { label: 'Mine' } }), replaceOwnerItems: true });
        const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');
        const value = valueOf(configuration, 'navbar', 'items')!;

        value.items!.map(item => item.id).should.deep.equal(['mine']);
        value.items![0].fixed.should.be.false;
        value.source.should.equal(ValueSource.Instance);
        codes(configuration).should.deep.equal([]);
    });

    it('should keep the hidden owner items as the inherited value so they come back', () => {
        const document = createReExposedDocument();
        document.exposures[0].properties[0].operations = [CollectionOperation.Add, CollectionOperation.Replace];
        document.exposures[1].properties[0].operations = [CollectionOperation.Add, CollectionOperation.Replace];
        document.instanceContributions.push({ ...items('template:Feature'), replaceOwnerItems: true });
        const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');
        const value = valueOf(configuration, 'navbar', 'items')!;

        value.items!.should.deep.equal([]);
        (value.inheritedValue as { id: string }[]).map(item => item.id).should.deep.equal(['home']);
    });

    it('should ignore the replacement when replacing is not exposed', () => {
        const document = createReExposedDocument();
        document.instanceContributions.push({ ...items('template:Feature', { id: 'mine', values: { label: 'Mine' } }), replaceOwnerItems: true });
        const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');

        valueOf(configuration, 'navbar', 'items')!.items!.map(item => item.id).should.deep.equal(['home']);
        codes(configuration).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
    });

    it('should hide nothing when the instance does not ask to replace', () => {
        const document = createReExposedDocument();
        document.exposures[0].properties[0].operations = [CollectionOperation.Add, CollectionOperation.Replace];
        document.exposures[1].properties[0].operations = [CollectionOperation.Add, CollectionOperation.Replace];
        document.instanceContributions.push(items('template:Feature', { id: 'mine', values: { label: 'Mine' } }));
        const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');

        valueOf(configuration, 'navbar', 'items')!.items!.map(item => item.id).should.deep.equal(['home', 'mine']);
    });
});
