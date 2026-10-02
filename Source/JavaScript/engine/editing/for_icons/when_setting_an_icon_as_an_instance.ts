// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, DiagnosticSeverity, SceneEditKind } from '@cratis/scene.model';
import { alphaName, betaName, defaultSources, openCatalog, componentsNeedingNewerBeta } from '../../icons/for_iconFixtures/iconFixtures';
import { apply, codesOf } from '../for_applyEdit/given/edits';
import { createIconDocument, iconContext } from './given/an_icon_document';

const setLogo = (value: unknown) => ({ kind: SceneEditKind.SetInstanceValue as const, component: 'bar', path: 'logo', value });

describe('when setting an icon as an instance', () => {
    const document = createIconDocument();

    describe('and the effective catalog has the icon', () => {
        it('should store the reference as the screen\'s contribution', async () => {
            const icons = openCatalog([alphaName, betaName], defaultSources());
            await icons.load();
            const outcome = apply(document, setLogo({ library: betaName, key: 'bin' }), iconContext('Invoices', icons));
            outcome.applied.should.be.true;
            outcome.model.instanceContributions.should.deep.equal([{ instance: 'screen:Invoices', component: 'bar', path: 'logo', value: { library: betaName, key: 'bin' } }]);
        });

        it('should accept a name two libraries share, keeping each library\'s own icon', async () => {
            const icons = openCatalog([alphaName, betaName], defaultSources());
            await icons.load();
            const fromAlpha = apply(document, setLogo({ library: alphaName, key: 'home', variant: 'outline' }), iconContext('Invoices', icons));
            const fromBeta = apply(document, setLogo({ library: betaName, key: 'home' }), iconContext('Invoices', icons));
            fromAlpha.applied.should.be.true;
            fromBeta.applied.should.be.true;
            (fromAlpha.model.instanceContributions[0].value as { library: string }).library.should.equal(alphaName);
            (fromBeta.model.instanceContributions[0].value as { library: string }).library.should.equal(betaName);
        });
    });

    describe('and the icon cannot be supplied', () => {
        const cases: [string, unknown, DiagnosticCode][] = [
            ['the library is not in the profile', { library: '@fixtures/unknown', key: 'home' }, DiagnosticCode.MissingIconLibrary],
            ['the library has no such icon', { library: alphaName, key: 'rocket' }, DiagnosticCode.MissingIcon],
            ['the icon has no such variant', { library: alphaName, key: 'home', variant: 'duotone' }, DiagnosticCode.MissingIconVariant],
        ];

        for (const [name, value, code] of cases) {
            it(`should refuse and leave the document alone when ${name}`, async () => {
                const icons = openCatalog([alphaName], defaultSources());
                await icons.load();
                const outcome = apply(document, setLogo(value), iconContext('Invoices', icons));
                outcome.applied.should.be.false;
                codesOf(outcome).should.deep.equal([code]);
                outcome.model.instanceContributions.should.be.empty;
            });
        }

        it('should refuse an icon from a library at an incompatible version', async () => {
            const icons = openCatalog([componentsNeedingNewerBeta.name], defaultSources());
            await icons.load();
            codesOf(apply(document, setLogo({ library: betaName, key: 'home' }), iconContext('Invoices', icons))).should.deep.equal([DiagnosticCode.IncompatibleIconLibrary]);
        });
    });

    describe('and the catalog has not been loaded', () => {
        it('should go ahead and warn that the icon was not verified', () => {
            const icons = openCatalog([alphaName], defaultSources());
            const outcome = apply(document, setLogo({ library: alphaName, key: 'home' }), iconContext('Invoices', icons));
            outcome.applied.should.be.true;
            outcome.diagnostics.map((diagnostic) => [diagnostic.code, diagnostic.severity]).should.deep.equal([[DiagnosticCode.IconNotVerified, DiagnosticSeverity.Warning]]);
        });

        it('should still refuse a library the profile does not have, which needs no catalog to know', () => {
            const icons = openCatalog([alphaName], defaultSources());
            codesOf(apply(document, setLogo({ library: betaName, key: 'home' }), iconContext('Invoices', icons))).should.deep.equal([DiagnosticCode.MissingIconLibrary]);
        });
    });

    describe('and there is no icon catalog in the context', () => {
        it('should check the shape only, as before', () => {
            apply(document, setLogo({ library: '@fixtures/unknown', key: 'home' }), iconContext('Invoices')).applied.should.be.true;
            codesOf(apply(document, setLogo('pi pi-home'), iconContext('Invoices'))).should.deep.equal([DiagnosticCode.InvalidValue]);
        });
    });
});
