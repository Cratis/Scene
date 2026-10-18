// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, SceneElement, ScreenTemplate, TemplateReferenceSource, TemplateRole } from '@cratis/scene.model';
import { listScreenTemplate } from '../../foundation/templates/listScreenTemplate';
import { composeApplicationScreen, composeOutletScreen, screenContent } from '../composeApplication';
import { element, ordersApplication } from '../for_ScenePreviewHost/given';

const asComponent = (value: SceneElement) => value as ExternalComponent;
const ids = (elements: SceneElement[]) => elements.map(value => asComponent(value).id);

function seededScreen() {
    const application = ordersApplication();
    const template: ScreenTemplate = {
        name: 'Seeded', fitsSlot: 'content', slots: [{ name: 'header' }, { name: 'body' }, { name: 'forms' }],
        content: {
            header: [element('seed-header', 'test:page')],
            body: [element('seed-body', 'test:page')],
            forms: [element('seed-form', 'test:form')],
        },
    };
    application.screenTemplates = [template];
    const screen = { ...application.screens[1], screenTemplate: template.name, slotContent: { header: [element('authored-header', 'test:page')] } };
    return { application, template, screen };
}

describe('when replacing seeded slot content', () => {
    describe('and only one slot is authored', () => {
        const { application, template, screen } = seededScreen();
        const slots = asComponent(asComponent(composeApplicationScreen(application, screen).element).slots.content[0]).slots;

        it('should replace every seeded element in the authored slot', () => ids(slots.header).should.deep.equal(['authored-header']));
        it('should keep the seed in an unauthored slot', () => ids(slots.body).should.deep.equal(['seed-body']));
        it('should keep seeded forms when the screen hosts none', () => ids(slots.forms).should.deep.equal(['seed-form']));
        it('should leave the template seed unchanged', () => ids(template.content!.header).should.deep.equal(['seed-header']));
        it('should leave the authored content unchanged', () => ids(screen.slotContent.header).should.deep.equal(['authored-header']));
    });

    describe('and the authored slot is explicitly empty', () => {
        const { application, screen } = seededScreen();
        const slots = asComponent(screenContent(application, { ...screen, slotContent: { header: [] } }).content[0]).slots;

        it('should clear its seed', () => slots.header.should.deep.equal([]));
        it('should keep an absent slots seed', () => ids(slots.body).should.deep.equal(['seed-body']));
    });

    describe('and no slots are authored', () => {
        const { application, screen } = seededScreen();
        const slots = asComponent(screenContent(application, { ...screen, slotContent: {} }).content[0]).slots;

        it('should keep all seeded content', () => [ids(slots.header), ids(slots.body), ids(slots.forms)].should.deep.equal([['seed-header'], ['seed-body'], ['seed-form']]));
    });

    describe('and the screen is placed in a nested outlet', () => {
        const { application, screen } = seededScreen();
        const slots = asComponent(composeOutletScreen(application, screen)).slots;

        it('should replace the seed just as in the primary screen', () => ids(slots.header).should.deep.equal(['authored-header']));
        it('should keep unauthored content', () => ids(slots.body).should.deep.equal(['seed-body']));
    });

    describe('and a nested template occupies a seeded parent slot', () => {
        const { application, template, screen } = seededScreen();
        application.screenTemplates.push({ name: 'Inner', fitsSlot: 'body', slots: [{ name: 'detail' }] });
        const slots = asComponent(screenContent(application, { ...screen, screenTemplate: 'Inner', slotContent: { detail: [element('record', 'test:page')] } }).content[0]).slots;

        it('should replace the parent slots seed with the inner template', () => ids(slots.body).should.deep.equal([`template-${screen.name}-Inner`]));
        it('should preserve the parents other content', () => ids(slots.header).should.deep.equal(['seed-header']));
        it('should leave the parent seed unchanged', () => ids(template.content!.body).should.deep.equal(['seed-body']));
    });

    describe('and the screen hosts a form in an authored forms slot', () => {
        const { application, screen } = seededScreen();
        const slots = asComponent(screenContent(application, {
            ...screen, slotContent: { forms: [element('authored-form', 'test:form')] },
            forms: [{ name: 'Place', forCommand: 'PlaceOrder', generationMode: 'auto', fields: [] } as never],
        }, { form: () => element('hosted-form', 'test:form') }).content[0]).slots;

        it('should append hosted forms after authored content without the seed', () => ids(slots.forms).should.deep.equal(['authored-form', 'hosted-form']));
    });

    describe('and the screen hosts a form without authoring the forms slot', () => {
        const { application, screen } = seededScreen();
        const slots = asComponent(screenContent(application, {
            ...screen, forms: [{ name: 'Place', forCommand: 'PlaceOrder', generationMode: 'auto', fields: [] } as never],
        }, { form: () => element('hosted-form', 'test:form') }).content[0]).slots;

        it('should preserve hosted forms append behavior', () => ids(slots.forms).should.deep.equal(['seed-form', 'hosted-form']));
    });

    describe('and Products fills ListScreens header and list', () => {
        const application = ordersApplication();
        const screen = {
            ...application.screens[1], screenTemplate: 'ListScreen', slotContent: {
                header: [element('products-header', 'pageHeader', { title: 'Products' })],
                list: [element('products-table', 'test:table')],
            },
        };
        const composed = composeApplicationScreen(application, screen);
        const slots = asComponent(asComponent(composed.element).slots.content[0]).slots;

        it('should use the shipped ListScreen', () => composed.templates.should.deep.equal(['ListScreen']));
        it('should show only the Products header', () => ids(slots.header).should.deep.equal(['products-header']));
        it('should show only the products table', () => ids(slots.list).should.deep.equal(['products-table']));
        it('should keep the unauthored toolbar and filters', () => [ids(slots.toolbar), ids(slots.filters)].should.deep.equal([ids(listScreenTemplate.content!.toolbar), ids(listScreenTemplate.content!.filters)]));
    });

    describe('and the root template has seeded outlets and chrome', () => {
        const application = ordersApplication();
        application.screenTemplates = [{
            name: 'Frame', slots: [{ name: 'main' }, { name: 'topbar' }, { name: 'rail' }, { name: 'side' }],
            content: {
                main: [element('seed-main', 'test:page')], topbar: [element('seed-topbar', 'test:page')],
                rail: [element('seed-rail', 'test:page')], side: [element('seed-side', 'test:page')],
            },
            metadata: { role: TemplateRole.Root, primaryOutlet: 'main' },
        }];
        application.uiProfiles = [{ ...application.uiProfiles![0], root: { template: { source: TemplateReferenceSource.Own, id: 'Frame' } } }];
        const slots = asComponent(composeApplicationScreen(application, application.screens[1], {
            chrome: () => ({ main: [element('host-main', 'test:page')], topbar: [element('host-topbar', 'test:page')] }),
            trailing: [element('status', 'test:page')], hostedOutlets: ['side'],
        }).element).slots;

        it('should replace the primary seed and keep host chrome and trailing content once', () => ids(slots.main).should.deep.equal(['host-main', 'orders', 'order-list', 'status']));
        it('should replace seeded chrome with host chrome', () => ids(slots.topbar).should.deep.equal(['host-topbar']));
        it('should keep an unfilled roots content', () => ids(slots.rail).should.deep.equal(['seed-rail']));
        it('should replace a hosted outlets seed', () => ids(slots.side).should.deep.equal(['outlet-side']));
    });
});
