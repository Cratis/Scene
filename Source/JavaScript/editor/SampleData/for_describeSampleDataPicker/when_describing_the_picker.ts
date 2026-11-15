// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describeSampleDataCatalog } from '@cratis/scene.engine';
import { PackageKind, type ScenePackage } from '@cratis/scene.model';
import { CascadeEntry, CascadeEntryKind } from '../../CascadeMenu';
import { describeActiveSampleData, describeSampleDataPicker } from '../describeSampleDataPicker';

const labels = { menu: 'Choose sample data', generated: 'Generated', myDataSets: 'My data sets', blueprints: 'Blueprints', newDataSet: 'New data set...', unavailable: '{id} is no longer available' };
const manifest = (name: string, displayName: string, packs: { id: string; title: string; locale: string }[]): ScenePackage => ({
    name, displayName, version: '1.0.0', kind: PackageKind.Blueprint, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [],
    sampleData: packs.map(pack => ({ ...pack, path: `sample-data/${pack.id}.json` })),
});
const sources = [
    { manifest: manifest('Cratis.Blueprint.Crm', 'CRM', [{ id: 'nordic-smb', title: 'CRM · Nordic SMB', locale: 'nb-NO' }, { id: 'enterprise-en', title: 'CRM · Enterprise EN', locale: 'en-GB' }]) },
    { manifest: manifest('Cratis.Blueprint.Ticketing', 'Ticketing', [{ id: 'helpdesk', title: 'Helpdesk', locale: 'en-GB' }]) },
];
const own = [{ id: 'acme-demo-orders', title: 'Acme demo orders', locale: 'en-GB' }];
const chosen: string[] = [];
const handlers = { onChoose: (pack: string) => chosen.push(pack), onNewDataSet: () => undefined };
const describe_ = (active: string, filter = '') => describeSampleDataPicker(describeSampleDataCatalog(sources, own, active), filter, labels, handlers);
const text = (entries: CascadeEntry[]) => entries.map(entry => `${entry.kind}:${entry.label}`);
const submenu = (entries: CascadeEntry[], id: string) => entries.find(entry => entry.kind === CascadeEntryKind.Submenu && entry.id === id) as Extract<CascadeEntry, { kind: CascadeEntryKind.Submenu }>;

describe('when describing the sample data picker', () => {
    const entries = describe_('nordic-smb');

    it('should list the generated choice, then the user\'s own data sets, then the blueprints one level deeper, then the footer', () => {
        text(entries).should.deep.equal([
            'heading:Generated', 'item:Generic (typed by field kind)', 'separator:', 'heading:My data sets', 'item:Acme demo orders', 'separator:', 'submenu:Blueprints', 'separator:', 'item:+ New data set...']);
    });

    it('should group each blueprint\'s packs under its name with the locale on the right', () => {
        const blueprints = submenu(entries, 'blueprints').entries;
        text(blueprints).should.deep.equal(['heading:CRM', 'item:Nordic SMB', 'item:Enterprise EN', 'heading:Ticketing', 'item:Helpdesk']);
        (blueprints[1] as { trailing?: string }).trailing!.should.equal('nb-NO');
    });

    it('should check the pack in effect and nothing else', () => {
        const checked = [...entries, ...submenu(entries, 'blueprints').entries].filter(entry => entry.kind === CascadeEntryKind.Item && entry.checked).map(entry => entry.label);
        checked.should.deep.equal(['Nordic SMB']);
    });

    it('should check the generated choice when no pack is chosen', () => {
        describe_('').filter(entry => entry.kind === CascadeEntryKind.Item && entry.checked).map(entry => entry.label).should.deep.equal(['Generic (typed by field kind)']);
    });

    it('should choose a pack by its identifier and the generated data by an empty one', () => {
        chosen.length = 0;
        const first = submenu(entries, 'blueprints').entries[1];
        const generated = entries[1];
        if (first.kind === CascadeEntryKind.Item) first.onActivate();
        if (generated.kind === CascadeEntryKind.Item) generated.onActivate();
        chosen.should.deep.equal(['nordic-smb', '']);
    });
});

describe('when filtering the sample data picker', () => {
    it('should keep only the matching packs and drop a blueprint with none', () => {
        const entries = describe_('', 'helpdesk');
        text(submenu(entries, 'blueprints').entries).should.deep.equal(['heading:Ticketing', 'item:Helpdesk']);
    });

    it('should match a pack by its locale', () => {
        text(submenu(describe_('', 'nb-no'), 'blueprints').entries).should.deep.equal(['heading:CRM', 'item:Nordic SMB']);
    });

    it('should leave out the blueprints when nothing in them matches', () => {
        text(describe_('', 'acme')).should.not.include('submenu:Blueprints');
    });
});

describe('when describing the pack in effect', () => {
    const catalog = describeSampleDataCatalog(sources, own);

    it('should name a blueprint pack by blueprint and pack', () => describeActiveSampleData(catalog, 'nordic-smb', labels).should.equal('CRM · Nordic SMB'));
    it('should name an own pack by its title', () => describeActiveSampleData(catalog, 'acme-demo-orders', labels).should.equal('Acme demo orders'));
    it('should name the generated data when nothing is chosen', () => describeActiveSampleData(catalog, '', labels).should.equal('Generic (typed by field kind)'));
    it('should say a pack nothing provides is unavailable', () => describeActiveSampleData(catalog, 'gone', labels).should.equal('gone is no longer available'));
});
