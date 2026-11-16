// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { sampleDataOf } from '../../UiProfile/sampleDataOf';
import { areDesignedProfilesEqual, designedProfileOf } from '../Session/DesignedProfile';
import { afterRemovingPack, bindProfileReadModel, chooseActivePack, mapProfileShape } from '../SampleData/chooseProfileSampleData';

const start = designedProfileOf(defaultUiProfileSettings(blueprintPreviewBundles), 'Acme');

describe('when choosing the active pack', () => {
    const chosen = chooseActivePack(start, 'own:orders');

    it('should store the pack', () => sampleDataOf(chosen).activePack.should.equal('own:orders'));
    it('should keep the application name', () => chosen.applicationName.should.equal('Acme'));
    it('should differ from the profile it came from, so it is a change to save', () => areDesignedProfilesEqual(start, chosen).should.be.false);
});

describe('when choosing the pack that is already active', () => {
    const chosen = chooseActivePack(start, 'own:orders');

    it('should return the same profile, so it is no edit at all', () => chooseActivePack(chosen, 'own:orders').should.equal(chosen));
    it('should treat the generated data chosen over no choice as no edit', () => chooseActivePack(start, '').should.equal(start));
});

describe('when choosing another pack after mapping a shape', () => {
    const mapped = mapProfileShape(chooseActivePack(start, 'own:orders'), 'Order', 'Orders');
    const switched = chooseActivePack(mapped, 'own:invoices');

    it('should keep the mappings', () => sampleDataOf(switched).mappings.should.deep.equal([{ shape: 'Order', readModel: 'Orders' }]));
});

describe('when mapping a shape to a read model', () => {
    const mapped = mapProfileShape(chooseActivePack(start, 'own:orders'), 'Order', 'Orders');

    it('should record the mapping', () => sampleDataOf(mapped).mappings.should.deep.equal([{ shape: 'Order', readModel: 'Orders' }]));
    it('should keep the active pack', () => sampleDataOf(mapped).activePack.should.equal('own:orders'));
    it('should replace an earlier mapping of the same shape', () => sampleDataOf(mapProfileShape(mapped, 'Order', 'Sales')).mappings.should.deep.equal([{ shape: 'Order', readModel: 'Sales' }]));
    it('should drop the mapping when it is cleared', () => sampleDataOf(mapProfileShape(mapped, 'Order', '')).mappings.should.be.empty);
});

describe('when the active pack is removed', () => {
    const profile = mapProfileShape(chooseActivePack(start, 'own:orders'), 'Order', 'Orders');
    const after = afterRemovingPack(profile, 'own:orders');

    it('should fall back to the generated data', () => sampleDataOf(after).activePack.should.equal(''));
    it('should drop the mappings that were for it', () => sampleDataOf(after).mappings.should.be.empty);
});

describe('when another pack is removed', () => {
    const profile = chooseActivePack(start, 'own:orders');

    it('should leave the profile as it is', () => afterRemovingPack(profile, 'own:invoices').should.equal(profile));
});

describe('when binding a read model to a pack', () => {
    const bound = bindProfileReadModel(chooseActivePack(start, 'own:orders'), 'Customers', 'own:crm');

    it('should record the binding', () => sampleDataOf(bound).bindings.should.deep.equal([{ target: 'Customers', pack: 'own:crm' }]));
    it('should keep the active pack', () => sampleDataOf(bound).activePack.should.equal('own:orders'));
    it('should replace an earlier binding of the read model', () => sampleDataOf(bindProfileReadModel(bound, 'Customers', 'own:other')).bindings.should.deep.equal([{ target: 'Customers', pack: 'own:other' }]));
    it('should remove the binding when the pack is empty', () => sampleDataOf(bindProfileReadModel(bound, 'Customers', '')).bindings.should.be.empty);
});

describe('when a pack that bindings point to is removed', () => {
    const profile = bindProfileReadModel(bindProfileReadModel(chooseActivePack(start, 'own:orders'), 'Customers', 'own:crm'), 'Invoices', 'own:billing');
    const after = afterRemovingPack(profile, 'own:crm');

    it('should drop the bindings to it', () => sampleDataOf(after).bindings.should.deep.equal([{ target: 'Invoices', pack: 'own:billing' }]));
    it('should keep the active pack', () => sampleDataOf(after).activePack.should.equal('own:orders'));
});

describe('when the active pack is removed and other read models are bound to other packs', () => {
    const profile = bindProfileReadModel(bindProfileReadModel(mapProfileShape(chooseActivePack(start, 'own:orders'), 'Shape', 'Orders'), 'Customers', 'own:crm'), 'Invoices', 'own:orders');
    const after = afterRemovingPack(profile, 'own:orders');

    it('should clear the active pack', () => sampleDataOf(after).activePack.should.equal(''));
    it('should clear the mappings', () => sampleDataOf(after).mappings.should.be.empty);
    it('should keep the bindings to other packs', () => sampleDataOf(after).bindings.should.deep.equal([{ target: 'Customers', pack: 'own:crm' }]));
});

describe('when a pack that is not active and has no bindings is removed', () => {
    const profile = bindProfileReadModel(chooseActivePack(start, 'own:orders'), 'Customers', 'own:crm');

    it('should leave the profile as it is', () => afterRemovingPack(profile, 'own:other').should.equal(profile));
});
