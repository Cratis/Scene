// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, SceneEditKind } from '@cratis/scene.model';
import { alphaName, betaName, defaultSources, openCatalog } from '../../icons/for_iconFixtures/iconFixtures';
import { apply, codesOf } from '../for_applyEdit/given/edits';
import { createIconDocument, iconContext } from './given/an_icon_document';

const add = (id: string, icon: unknown) => ({ kind: SceneEditKind.AddCollectionItem as const, component: 'bar', path: 'items', item: { id, values: { label: id, icon } } });

describe('when contributing icon items', () => {
    const document = createIconDocument();

    it('should add an item whose icon the catalog has', async () => {
        const icons = openCatalog([alphaName, betaName], defaultSources());
        await icons.load();
        const outcome = apply(document, add('bin', { library: betaName, key: 'bin' }), iconContext('Invoices', icons));
        outcome.applied.should.be.true;
        outcome.model.instanceContributions[0].items![0].values.icon!.should.deep.equal({ library: betaName, key: 'bin' });
    });

    it('should refuse an item whose icon the catalog lacks', async () => {
        const icons = openCatalog([alphaName], defaultSources());
        await icons.load();
        const outcome = apply(document, add('bin', { library: alphaName, key: 'bin' }), iconContext('Invoices', icons));
        outcome.applied.should.be.false;
        codesOf(outcome).should.deep.equal([DiagnosticCode.MissingIcon]);
        outcome.diagnostics[0].itemId!.should.equal('bin');
    });

    it('should refuse changing an item\'s icon to one from a library the profile lacks', async () => {
        const icons = openCatalog([alphaName, betaName], defaultSources());
        await icons.load();
        const added = apply(document, add('trash', { library: alphaName, key: 'trash' }), iconContext('Invoices', icons)).model;
        const outcome = apply(added, { kind: SceneEditKind.EditCollectionItem, component: 'bar', path: 'items', itemId: 'trash', field: 'icon', value: { library: '@fixtures/unknown', key: 'x' } }, iconContext('Invoices', icons));
        codesOf(outcome).should.deep.equal([DiagnosticCode.MissingIconLibrary]);
        outcome.model.should.deep.equal(added);
    });

    it('should accept the same icon name from either library on different items', async () => {
        const icons = openCatalog([alphaName, betaName], defaultSources());
        await icons.load();
        const first = apply(document, add('a', { library: alphaName, key: 'home' }), iconContext('Invoices', icons)).model;
        const second = apply(first, add('b', { library: betaName, key: 'home' }), iconContext('Invoices', icons));
        second.applied.should.be.true;
        second.model.instanceContributions[0].items!.map((item) => (item.values.icon as { library: string }).library).should.deep.equal([alphaName, betaName]);
    });
});
