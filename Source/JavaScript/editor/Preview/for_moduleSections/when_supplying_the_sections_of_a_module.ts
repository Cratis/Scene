// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicationStructure, SampleDataPack } from '@cratis/scene.model';
import { moduleSectionsPackId, moduleSectionsPackOf } from '../moduleSections';
import { previewSampleDataOf } from '../previewApplication';

const structure = {
    modules: [
        { id: 'purchasing', name: 'Purchasing', features: [{ id: 'purchasing.buying', name: 'Buying', features: [], slices: [] }, { id: 'purchasing.suppliers', name: 'Suppliers', features: [], slices: [] }], slices: [] },
        { id: 'empty', name: 'Empty', features: [], slices: [] },
    ],
} as ApplicationStructure;
const authored = { id: 'mine', title: 'Mine', locale: 'en', owner: 'application', sets: [{ shape: 'ModuleSections', rows: [{ id: 'own', label: 'Own' }] }] } as SampleDataPack;
const unrelated = { id: 'other', title: 'Other', locale: 'en', owner: 'application', sets: [{ shape: 'Orders', rows: [] }] } as SampleDataPack;

describe('when supplying the sections of a module', () => {
    const pack = moduleSectionsPackOf(structure, 'Purchasing.Buying.Suppliers', [unrelated])!;

    it('should make a row for each feature of the module', () => pack.sets[0].rows.map(row => row.id).should.deep.equal(['purchasing.buying', 'purchasing.suppliers']));
    it('should label each row with the name of the feature', () => pack.sets[0].rows.map(row => row.label).should.deep.equal(['Buying', 'Suppliers']));
    it('should name the set for the query the navigation reads', () => pack.sets[0].shape.should.equal('ModuleSections'));
    it('should find the module of a module node', () => moduleSectionsPackOf(structure, 'Purchasing', [])!.id.should.equal(moduleSectionsPackId));
    it('should make no pack when the model\'s own sample data carries the sections', () => (moduleSectionsPackOf(structure, 'Purchasing', [authored]) === undefined).should.be.true);
    it('should make no pack for a module without features', () => (moduleSectionsPackOf(structure, 'Empty', []) === undefined).should.be.true);
    it('should make no pack for a module the structure does not know', () => (moduleSectionsPackOf(structure, 'Unknown.Thing', []) === undefined).should.be.true);
    it('should make no pack without a structure', () => (moduleSectionsPackOf(undefined, 'Purchasing', []) === undefined).should.be.true);
    it('should hand the host the pack as the one asked last', () => previewSampleDataOf([pack], undefined, pack.id).blueprintDefaultPack!.should.equal(moduleSectionsPackId));
    it('should hand the host no fallback pack when there is none', () => ('blueprintDefaultPack' in previewSampleDataOf([], undefined)).should.be.false);
});
