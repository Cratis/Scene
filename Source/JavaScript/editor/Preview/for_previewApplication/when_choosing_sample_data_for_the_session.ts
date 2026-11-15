// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, type SampleDataPack, type UiProfile } from '@cratis/scene.model';
import { previewPacksOf, previewSampleDataCatalogOf, previewSampleDataOf } from '../previewApplication';
import type { PreviewScene } from '../PreviewScene';

const pack = (id: string, title: string): SampleDataPack => ({ id, title, locale: 'en-GB', owner: 'application', sets: [] });
const manifest = { name: 'Cratis.Blueprint.Crm', displayName: 'CRM', version: '1.0.0', kind: PackageKind.Blueprint, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [], sampleData: [{ id: 'nordic-smb', title: 'CRM · Nordic SMB', locale: 'nb-NO', path: 'x.json' }] };
const runtime = (activePack: string) => ({
    bundles: [{ manifest, components: {}, packs: [pack('nordic-smb', 'CRM · Nordic SMB')] } as never],
    profile: { sampleData: { activePack, mappings: [] } } as unknown as UiProfile,
});
const own = [pack('acme-demo-orders', 'Acme demo orders')];
const scene = { sampleDataPacks: [pack('from-the-model', 'From the model')] } as unknown as PreviewScene;

describe('when choosing sample data in the preview strip', () => {
    const applicationChoice = previewSampleDataCatalogOf(runtime('acme-demo-orders'), own, undefined);
    const sessionChoice = previewSampleDataCatalogOf(runtime('acme-demo-orders'), own, 'nordic-smb');
    const generated = previewSampleDataCatalogOf(runtime('acme-demo-orders'), own, '');

    it('should show the application\'s pack until the session chooses another', () => applicationChoice.activePack.should.equal('acme-demo-orders'));
    it('should show the pack the session chose instead', () => sessionChoice.activePack.should.equal('nordic-smb'));
    it('should show the generated data when the session chose that, though the application chose a pack', () => generated.activePack.should.equal(''));
    it('should mark the session\'s pack as the one in effect', () => sessionChoice.catalog.blueprints[0].packs.find(entry => entry.id === 'nordic-smb')!.selected.should.be.true);
    it('should not mark the application\'s pack as in effect while the session overrides it', () => sessionChoice.catalog.own.find(entry => entry.id === 'acme-demo-orders')!.selected.should.be.false);
    it('should hand the host the session\'s pack as an override and leave the application\'s setting to the profile', () => previewSampleDataOf([], 'nordic-smb').sessionActivePack!.should.equal('nordic-smb'));
    it('should hand the host no override when the session chose nothing, so the profile\'s pack applies', () => ('sessionActivePack' in previewSampleDataOf([], undefined)).should.be.false);
    it('should hand the host the empty override for the generated data, which is a choice', () => previewSampleDataOf([], '').sessionActivePack!.should.equal(''));
    it('should leave the application\'s own choice as it was - the session never writes to the profile', () => {
        const profile = runtime('acme-demo-orders').profile;
        previewSampleDataCatalogOf({ bundles: [], profile }, own, 'nordic-smb');
        profile.sampleData!.activePack!.should.equal('acme-demo-orders');
    });
    it('should draw from the blueprints\' packs, the model\'s and the application\'s together', () => previewPacksOf(scene, runtime(''), own).map(entry => entry.id).should.have.members(['nordic-smb', 'from-the-model', 'acme-demo-orders']));
    it('should let the application\'s own pack stand in for one of the same identifier', () => previewPacksOf(scene, runtime(''), [{ ...pack('nordic-smb', 'Mine'), owner: 'application' }]).find(entry => entry.id === 'nordic-smb')!.title.should.equal('Mine'));
});
