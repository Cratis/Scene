// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, DiagnosticSeverity, SceneDocument, SceneEditKind } from '@cratis/scene.model';
import { analyzeIconImpact, collectIconUsages, diagnoseIcons, elementNodeId, inspect } from '../../index';
import { alphaEntries, alphaName, betaName, countingSource, defaultSources, openCatalog } from '../../icons/for_iconFixtures/iconFixtures';
import { apply } from '../for_applyEdit/given/edits';
import { createIconDocument, iconCatalog, iconContext } from './given/an_icon_document';

async function storedDocument(): Promise<SceneDocument> {
    const icons = openCatalog([alphaName, betaName], defaultSources());
    await icons.load();
    let document = createIconDocument();
    document = apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'bar', path: 'logo', value: { library: alphaName, key: 'trash', variant: 'solid' } }, iconContext('Invoices', icons)).model;
    document = apply(document, { kind: SceneEditKind.AddCollectionItem, component: 'bar', path: 'items', item: { id: 'archive', values: { label: 'Archive', icon: { library: alphaName, key: 'trash' } } } }, iconContext('Invoices', icons)).model;
    return document;
}

describe('when stored icons are no longer available', () => {
    describe('and the library was removed from the profile', () => {
        it('should report each affected value with the instance and item that holds it', async () => {
            const document = await storedDocument();
            const icons = openCatalog([betaName], defaultSources());
            await icons.load();
            const diagnostics = diagnoseIcons(document, iconContext('Invoices', icons));

            diagnostics.every((diagnostic) => diagnostic.code === DiagnosticCode.MissingIconLibrary && diagnostic.severity === DiagnosticSeverity.Warning).should.be.true;
            diagnostics.map((diagnostic) => [diagnostic.component, diagnostic.path, diagnostic.instance, diagnostic.itemId]).should.deep.equal([
                ['bar', 'logo', 'screen:Invoices', undefined],
                ['bar', 'items', undefined, 'start'],
                ['bar', 'items', 'screen:Invoices', 'archive'],
            ]);
        });

        it('should keep the stored values untouched and still applied', async () => {
            const document = await storedDocument();
            const before = structuredClone(document);
            const icons = openCatalog([betaName], defaultSources());
            await icons.load();
            diagnoseIcons(document, iconContext('Invoices', icons));
            document.should.deep.equal(before);
        });

        it('should report the same problems when the node is inspected', async () => {
            const document = await storedDocument();
            const icons = openCatalog([betaName], defaultSources());
            await icons.load();
            const inspection = inspect(document, elementNodeId('bar'), iconContext('Invoices', icons))!;
            inspection.diagnostics.filter((diagnostic) => diagnostic.code === DiagnosticCode.MissingIconLibrary).should.have.length(3);
        });

        it('should report nothing once the library is back', async () => {
            const document = await storedDocument();
            const icons = openCatalog([alphaName, betaName], defaultSources());
            await icons.load();
            diagnoseIcons(document, iconContext('Invoices', icons)).should.be.empty;
        });
    });

    describe('and an upgrade dropped the icon', () => {
        it('should report a missing icon', async () => {
            const document = await storedDocument();
            const icons = openCatalog([alphaName], [countingSource(alphaName, alphaEntries.filter((entry) => entry.key !== 'trash'))]);
            await icons.load();
            const diagnostics = diagnoseIcons(document, iconContext('Invoices', icons));
            diagnostics.map((diagnostic) => [diagnostic.code, diagnostic.itemId]).should.deep.equal([
                [DiagnosticCode.MissingIcon, undefined],
                [DiagnosticCode.MissingIcon, 'archive'],
            ]);
        });
    });

    describe('and the whole document is analyzed for impact', () => {
        it('should find every stored icon, including instance overrides, and report those a removal would break', async () => {
            const document = await storedDocument();
            const usages = collectIconUsages(document, iconCatalog);
            usages.map((usage) => usage.location).should.have.members([
                'Module:bar:logo',
                'Module:bar:items:start:icon',
                'screen:Invoices:bar:logo',
                'screen:Invoices:bar:items:archive:icon',
            ]);

            const current = openCatalog([alphaName, betaName], defaultSources());
            const proposed = openCatalog([betaName], defaultSources());
            const report = await analyzeIconImpact(usages, current, proposed);
            report.affected.should.have.length(4);
            report.affected.every((item) => item.wasResolvable).should.be.true;
        });
    });
});
