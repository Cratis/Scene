// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource, TemplateRole } from '@cratis/scene.model';
import { diagnosePreview } from '../diagnosePreview';
import { navigation, ordersApplication, structure } from '../for_ScenePreviewHost/given';

const codes = (problems: { code: string; severity: string; nodeId?: string }[]) => problems.map(problem => [problem.code, problem.severity, problem.nodeId]);

describe('when diagnosing a preview', () => {
    describe('and the model is sound', () => {
        const { problems, screen, plan } = diagnosePreview({ document: ordersApplication(), structure, navigation, target: { module: 'sales' } });

        it('should find the page of the feature', () => screen!.name.should.equal('sales.orders'));
        it('should resolve the plan', () => plan!.kind.should.equal('module'));
        it('should find no blocking problem', () => problems.filter(problem => problem.severity === 'error').should.deep.equal([]));
    });

    describe('and the feature has no screen', () => {
        const document = ordersApplication();
        document.screens = document.screens.filter(screen => screen.name !== 'sales.orders');
        const { problems } = diagnosePreview({ document, structure, navigation, target: { module: 'sales' } });

        it('should be an error naming the feature', () => codes(problems.filter(problem => problem.severity === 'error')).should.deep.equal([['screenMissing', 'error', 'sales.orders']]));
    });

    describe('and a slice preview has no screen for its feature', () => {
        const document = ordersApplication();
        document.screens = document.screens.filter(screen => screen.name !== 'sales.orders');
        const { problems } = diagnosePreview({ document, structure, navigation, target: { slice: 'sales.orders.PlaceOrder' } });

        it('should be fine: a minimal host page is used', () => problems.filter(problem => problem.severity === 'error').should.deep.equal([]));
    });

    describe('and the screen names a layout nobody provides', () => {
        const document = ordersApplication();
        document.screens = document.screens.map(screen => screen.name === 'sales.orders' ? { ...screen, layout: 'Ghost' } : screen);
        const { problems } = diagnosePreview({ document, structure, navigation, target: { module: 'sales' } });

        it('should be an error naming the screen', () => codes(problems.filter(problem => problem.severity === 'error')).should.deep.equal([['layoutMissing', 'error', 'sales.orders']]));
    });

    describe('and the screen names a template nobody provides', () => {
        const document = ordersApplication();
        document.screens = document.screens.map(screen => screen.name === 'sales.orders' ? { ...screen, screenTemplate: 'Ghost' } : screen);
        const { problems } = diagnosePreview({ document, structure, navigation, target: { module: 'sales' } });

        it('should be an error naming the screen', () => codes(problems.filter(problem => problem.severity === 'error')).should.deep.equal([['templateMissing', 'error', 'sales.orders']]));
    });

    describe('and the screen template fits a slot nothing declares', () => {
        const document = ordersApplication();
        document.screenTemplates = [{ name: 'Lost', fitsSlot: 'nowhere', slots: [{ name: 'body' }] }];
        document.screens = document.screens.map(screen => screen.name === 'sales.orders' ? { ...screen, screenTemplate: 'Lost' } : screen);
        const { problems } = diagnosePreview({ document, structure, navigation, target: { module: 'sales' } });

        it('should be an error naming the template', () => codes(problems.filter(problem => problem.severity === 'error')).should.deep.equal([['templateUnplaced', 'error', 'Lost']]));
    });

    describe('and the navigation leads to a feature that does not exist', () => {
        const withGhost = structuredClone(navigation);
        withGhost.modules[0].regions[0].items.push({ id: 'ghost', title: 'Ghost', target: { module: 'sales', feature: 'ghosts' } });
        const { problems } = diagnosePreview({ document: ordersApplication(), structure, navigation: withGhost, target: { module: 'sales' } });

        it('should be reported as a warning on the item, which does not block', () => codes(problems.filter(problem => problem.code === 'navigationInvalid')).should.deep.equal([['navigationInvalid', 'warning', 'sales:sidebar:ghost']]));
    });

    describe('and a toolbar button names a slice that is not there', () => {
        const document = ordersApplication();
        document.screens = document.screens.map(screen => screen.name === 'sales.customers'
            ? { ...screen, slotContent: { content: [{ id: 'bad', componentName: 'core:toolbarItem', properties: { kind: 'Action', label: 'Bad', slice: 'sales.orders.Ghost' }, slots: {} } as never] } }
            : screen);
        const { problems } = diagnosePreview({ document, structure, navigation, target: { module: 'sales' } });

        it('should be a warning on the button', () => codes(problems.filter(problem => problem.code === 'toolbarInvalid' && problem.nodeId === 'bad')).should.deep.equal([['toolbarInvalid', 'warning', 'bad']]));
    });

    describe('and the profile selects a pack that is not available', () => {
        const document = ordersApplication();
        document.uiProfiles = [{ ...document.uiProfiles![0], sampleData: { activePack: 'missing', mappings: [], bindings: [] } }];
        const { problems } = diagnosePreview({ document, structure, navigation, target: { module: 'sales' }, packs: [] });

        it('should be a warning', () => codes(problems.filter(problem => problem.code === 'sampleDataInvalid')).should.deep.equal([['sampleDataInvalid', 'warning', undefined]]));
    });

    describe('and the structure repeats an id', () => {
        const duplicated = { modules: [...structure.modules, { id: 'sales', name: 'Sales again', features: [] }] };
        const { problems } = diagnosePreview({ document: ordersApplication(), structure: duplicated, navigation, target: { module: 'sales' } });

        it('should warn about the structure', () => problems.filter(problem => problem.code === 'structureInvalid').length.should.equal(1));
    });
});

describe('when diagnosing a preview of an application with its own root template', () => {
    // Cratis/Scene#225: the screen's layout and the root template both declare 'content'; the screen is composed inside the root template,
    // so a template that fits 'content' has the root template as its one container and is not reported unplaced.
    const document = ordersApplication();
    document.screenTemplates = [
        {
            name: 'Frame', slots: [{ name: 'topbar' }, { name: 'content' }, { name: 'footer' }],
            metadata: { role: TemplateRole.Root, primaryOutlet: 'content' },
        },
        { name: 'Side', fitsSlot: 'content', slots: [{ name: 'main' }, { name: 'summary' }] },
    ];
    document.uiProfiles = [{ ...document.uiProfiles![0], root: { template: { source: TemplateReferenceSource.Own, id: 'Frame' } } }];
    document.screens = document.screens.map(screen => screen.name === 'sales.orders' ? { ...screen, screenTemplate: 'Side' } : screen);
    const { problems } = diagnosePreview({ document, structure, navigation, target: { module: 'sales' } });

    it('should find no blocking problem', () => problems.filter(problem => problem.severity === 'error').should.deep.equal([]));
});
