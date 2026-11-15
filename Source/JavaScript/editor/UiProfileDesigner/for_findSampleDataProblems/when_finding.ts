// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataPack } from '@cratis/scene.model';
import { describeSampleDataCatalog } from '@cratis/scene.engine';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { ProfileNodeKind } from '../Structure/ProfileNodeKind';
import { bindProfileReadModel, chooseActivePack, mapProfileShape } from '../SampleData/chooseProfileSampleData';
import { findSampleDataProblems } from '../SampleData/findSampleDataProblems';
import { designedProfileOf } from '../Session/DesignedProfile';

const orders: SampleDataPack = { id: 'orders', title: 'Orders', locale: 'en-GB', owner: 'user', sets: [{ shape: 'Order', rows: [{ id: 1 }] }] };
const start = designedProfileOf(defaultUiProfileSettings(blueprintPreviewBundles), 'Acme');
const text = {
    sampleDataBindingInvalidReadModel: '{readModel} invalid',
    sampleDataBindingUnknownReadModel: '{readModel} unknown',
    sampleDataBindingNoData: '{pack} lacks {readModel}',
};
const problemsOf = (profile: typeof start, packs: SampleDataPack[], readModels: string[] = []) =>
    findSampleDataProblems(profile, { packs, readModels }, describeSampleDataCatalog(blueprintPreviewBundles, packs, ''), text);

describe('when the profile uses the generated data', () => {
    it('should find nothing wrong', () => problemsOf(start, [orders]).should.be.empty);
});

describe('when the profile uses a pack that exists', () => {
    it('should find nothing wrong', () => problemsOf(chooseActivePack(start, 'orders'), [orders]).should.be.empty);
});

describe('when the profile uses a pack that no longer exists', () => {
    const found = problemsOf(chooseActivePack(start, 'gone'), [orders]);

    it('should find a problem', () => found.length.should.be.greaterThan(0));
    it('should put it on the Sample data node', () => found.every(problem => problem.node === ProfileNodeKind.SampleData).should.be.true);
    it('should make it an error', () => found.every(problem => problem.severity === 'error').should.be.true);
    it('should give it a code the editor can filter on', () => found[0].code.should.equal('sampleDataInvalid'));
});

describe('when one read model is fed by two shapes', () => {
    const profile = mapProfileShape(mapProfileShape(chooseActivePack(start, 'orders'), 'Order', 'Orders'), 'Invoice', 'Orders');

    it('should find a problem', () => problemsOf(profile, [orders]).length.should.be.greaterThan(0));
});

describe('when a read model is bound to a pack that exists', () => {
    it('should find nothing wrong', () => problemsOf(bindProfileReadModel(start, 'Order', 'orders'), [orders], ['Order']).should.be.empty);
});

describe('when two bindings name the same read model', () => {
    const profile = { ...start, sampleData: { activePack: '', mappings: [], bindings: [{ target: 'Order', pack: 'orders' }, { target: 'Order', pack: 'orders' }] } };

    it('should surface Scene\'s duplicate target error', () => problemsOf(profile, [orders], ['Order']).some(problem => problem.code === 'sampleDataInvalid' && problem.message.includes('more than once')).should.be.true);
});

describe('when a read model is bound to a pack that does not exist', () => {
    it('should surface Scene\'s unknown pack error', () => problemsOf(bindProfileReadModel(start, 'Order', 'gone'), [orders], ['Order']).some(problem => problem.code === 'sampleDataInvalid' && problem.message.includes('not available')).should.be.true);
});

describe('when the bound read model is not a Screenplay identifier', () => {
    const found = problemsOf(bindProfileReadModel(start, 'Bad name', 'orders'), [orders], ['Bad name']);
    const invalid = found.find(problem => problem.code === 'sampleDataBindingInvalidReadModel');

    it('should make it an error', () => invalid!.severity.should.equal('error'));
    it('should name the read model', () => invalid!.message.should.equal('Bad name invalid'));
    it('should put it on the Sample data node', () => invalid!.node.should.equal(ProfileNodeKind.SampleData));
});

describe('when the bound read model is not one the application has', () => {
    const profile = bindProfileReadModel(start, 'Gone', 'orders');

    it('should warn when the application lists its read models', () => problemsOf(profile, [orders], ['Order']).find(problem => problem.code === 'sampleDataBindingUnknownReadModel')!.severity.should.equal('warning'));
    it('should say nothing when no read models are listed', () => problemsOf(profile, [orders], []).some(problem => problem.code === 'sampleDataBindingUnknownReadModel').should.be.false);
});

describe('when the bound own pack has no data for the read model', () => {
    const found = problemsOf(bindProfileReadModel(start, 'Customer', 'orders'), [orders], ['Customer']);

    it('should warn that it supplies none', () => found.find(problem => problem.code === 'sampleDataBindingNoData')!.message.should.equal('orders lacks Customer'));
});
