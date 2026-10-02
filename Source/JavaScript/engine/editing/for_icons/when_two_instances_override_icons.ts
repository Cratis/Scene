// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from '@cratis/scene.model';
import { alphaName, betaName, defaultSources, openCatalog } from '../../icons/for_iconFixtures/iconFixtures';
import { resolveEffectiveConfiguration, resolveTemplateChain } from '../../index';
import { apply } from '../for_applyEdit/given/edits';
import { createIconDocument, iconCatalog, iconContext } from './given/an_icon_document';

describe('when two instances override icons', () => {
    it('should keep each instance\'s contribution independent', async () => {
        const icons = openCatalog([alphaName, betaName], defaultSources());
        await icons.load();
        const set = (value: unknown) => ({ kind: SceneEditKind.SetInstanceValue as const, component: 'bar', path: 'logo', value });

        let document = createIconDocument();
        document = apply(document, set({ library: alphaName, key: 'trash', variant: 'outline' }), iconContext('Invoices', icons)).model;
        document = apply(document, set({ library: betaName, key: 'home' }), iconContext('Customers', icons)).model;

        const logoOf = (screen: string) => {
            const chain = resolveTemplateChain(document, iconContext(screen).scope);
            return resolveEffectiveConfiguration(chain, document.instanceContributions, iconCatalog).components[0].values.find((value) => value.path === 'logo')!;
        };

        (logoOf('Invoices').value as object).should.deep.equal({ library: alphaName, key: 'trash', variant: 'outline' });
        (logoOf('Customers').value as object).should.deep.equal({ library: betaName, key: 'home' });
        logoOf('Invoices').contributedBy!.should.equal('screen:Invoices');
        logoOf('Customers').contributedBy!.should.equal('screen:Customers');
    });

    it('should leave the other instance alone when one resets', async () => {
        const icons = openCatalog([alphaName, betaName], defaultSources());
        await icons.load();
        let document = createIconDocument();
        for (const [screen, library, key] of [['Invoices', alphaName, 'trash'], ['Customers', betaName, 'bin']]) {
            document = apply(document, { kind: SceneEditKind.SetInstanceValue, component: 'bar', path: 'logo', value: { library, key } }, iconContext(screen, icons)).model;
        }

        document = apply(document, { kind: SceneEditKind.ResetInstanceValue, component: 'bar', path: 'logo' }, iconContext('Invoices', icons)).model;
        document.instanceContributions.map((contribution) => contribution.instance).should.deep.equal(['screen:Customers']);
    });
});
