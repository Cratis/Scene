// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, SceneElement, ScreenTemplate } from '@cratis/scene.model';
import { ComponentName } from '../../ComponentName';
import { galleryScreenTemplates } from '../../gallery/screens';
import { defaultLayouts } from '../../layouts';
import { ApplicationDocument } from '../ApplicationDocument';
import { collectDestinations, composeApplicationScreen, composeDialog, composeOutletScreen, screenContent, templateChainOf } from '../composeApplication';
import { previewTemplateComponent } from '../PreviewTemplate';
import { previewProfile } from '../previewProfile';
import { element, ordersApplication } from '../for_ScenePreviewHost/given';

const asComponent = (value: SceneElement) => value as ExternalComponent;
const slotNames = (value: SceneElement) => Object.keys(asComponent(value).slots);
const ids = (elements: SceneElement[]) => elements.map(value => (value as ExternalComponent).id);

function nested(): { application: ApplicationDocument; outer: ScreenTemplate; inner: ScreenTemplate } {
    const outer: ScreenTemplate = { name: 'Workspace', fitsSlot: 'content', slots: [{ name: 'header' }, { name: 'body' }], content: { header: [element('workspace-header', 'test:page')] } };
    const inner: ScreenTemplate = { name: 'Section', fitsSlot: 'body', slots: [{ name: 'toolbar' }, { name: 'list' }], content: { toolbar: [element('section-toolbar', 'test:page')] } };
    const application = ordersApplication();
    application.screenTemplates = [outer, inner];
    application.screens = application.screens.map(screen => screen.name === 'sales.orders'
        ? { ...screen, screenTemplate: 'Section', slotContent: { list: [element('orders-list', 'test:page')] } }
        : screen);
    return { application, outer, inner };
}

describe('when composing a screen', () => {
    describe('and the screen names no template', () => {
        const application = ordersApplication();
        const composed = composeApplicationScreen(application, application.screens[1]);

        it('should be the shell of its layout, resolved to the blueprint', () => asComponent(composed.element).componentName.should.equal('Cratis.Blueprint.Default:appShell'));
        it('should chrome the shell with a topbar, a sidebar and a breadcrumb that follows the location', () => slotNames(composed.element).sort().should.deep.equal(['breadcrumb', 'content', 'sidebar', 'topbar']));
        it('should place the screen content in the content slot', () => ids(asComponent(composed.element).slots.content).should.deep.equal(['orders', 'order-list']));
        it('should name no template', () => composed.templates.should.deep.equal([]));
        it('should resolve no configuration without descriptors', () => (composed.configuration === undefined).should.equal(true));
    });

    describe('and the layout is the full page', () => {
        it('should not chrome it with navigation', () => {
            const application = ordersApplication();
            const composed = composeApplicationScreen(application, { ...application.screens[0], layout: 'FullPage' });
            [asComponent(composed.element).componentName, slotNames(composed.element)].should.deep.equal(['Cratis.Blueprint.Default:fullPageShell', ['content']]);
        });
    });

    describe('and the screen names a template inside another', () => {
        const { application, outer, inner } = nested();
        const screen = application.screens[1];
        const composed = composeApplicationScreen(application, screen);

        it('should find the chain outermost first', () => templateChainOf(application, screen).map(template => template.name).should.deep.equal([outer.name, inner.name]));
        it('should report the templates around the screen', () => composed.templates.should.deep.equal(['Workspace', 'Section']));
        it('should wrap the chain in the template component once, in the content slot', () => {
            const content = asComponent(composed.element).slots.content;
            [content.length, asComponent(content[0]).componentName].should.deep.equal([1, previewTemplateComponent]);
        });
        it('should keep the outer template content and hold the inner template in the slot it fits', () => {
            const workspace = asComponent(asComponent(composed.element).slots.content[0]);
            [Object.keys(workspace.slots), ids(workspace.slots.header), ids(workspace.slots.body)].should.deep.equal([['header', 'body'], ['workspace-header'], ['template-sales.orders-Section']]);
        });
        it('should give the inner template the content of the screen', () => {
            const section = asComponent(asComponent(asComponent(composed.element).slots.content[0]).slots.body[0]);
            [ids(section.slots.toolbar), ids(section.slots.list)].should.deep.equal([['section-toolbar'], ['orders-list']]);
        });
    });

    describe('and the screen names a template inside another and the host composes only the named template', () => {
        const { application, inner } = nested();
        const screen = application.screens[1];
        const options = { namedTemplateOnly: true };
        const composed = composeApplicationScreen(application, screen, options);
        const content = asComponent(composed.element).slots.content;

        it('should find only the named template', () => templateChainOf(application, screen, options).map(template => template.name).should.deep.equal([inner.name]));
        it('should report only the named template', () => composed.templates.should.deep.equal(['Section']));
        it('should place the named template in the content slot without the outer template or its seeded content', () =>
            [content.length, asComponent(content[0]).id].should.deep.equal([1, 'template-sales.orders-Section']));
        it('should give the named template the content of the screen and its own seeds', () => {
            const section = asComponent(content[0]);
            [ids(section.slots.toolbar), ids(section.slots.list)].should.deep.equal([['section-toolbar'], ['orders-list']]);
        });
    });

    describe('and the screen names a template of the blueprint the document does not declare', () => {
        it('should compose it as the document would its own', () => {
            const application = ordersApplication();
            const template = galleryScreenTemplates[0];
            const screen = { ...application.screens[1], screenTemplate: template.name };
            screenContent(application, screen).templates.should.deep.equal([template.name]);
        });
    });

    describe('and the document declares a template of the same name as the blueprint', () => {
        it('should use the documents own', () => {
            const application = ordersApplication();
            const own: ScreenTemplate = { name: galleryScreenTemplates[0].name, fitsSlot: 'content', slots: [{ name: 'only' }] };
            application.screenTemplates = [own];
            templateChainOf(application, { ...application.screens[1], screenTemplate: own.name })[0].slots.should.deep.equal([{ name: 'only' }]);
        });
    });

    describe('and the host decides the chrome, the trailing content and a last pass', () => {
        const application = ordersApplication();
        const composed = composeApplicationScreen(application, application.screens[1], {
            chrome: () => ({ menu: [element('own-menu', 'test:page')] }),
            trailing: [element('activity', 'test:page')],
            decorate: value => ({ ...value, decorated: true }) as unknown as SceneElement,
        });

        it('should use its chrome', () => slotNames(composed.element).sort().should.deep.equal(['content', 'menu']));
        it('should place its trailing content after the screen', () => ids(asComponent(composed.element).slots.content).should.deep.equal(['orders', 'order-list', 'activity']));
        it('should let it decorate the tree before names are resolved', () => (composed.element as unknown as { decorated: boolean }).decorated.should.equal(true));
    });

    describe('and the screen hosts forms', () => {
        it('should compose each as a command form, as the host says', () => {
            const application = ordersApplication();
            const screen = { ...application.screens[1], forms: [{ name: 'Place', forCommand: 'PlaceOrder', generationMode: 'auto', fields: [] } as never] };
            const content = screenContent(application, screen, { form: (name, form) => element(`form-${name}`, 'test:form', { command: form.forCommand }) }).content;
            ids(content).should.deep.equal(['orders', 'order-list', 'form-sales.orders']);
        });
        it('should default to the Cratis command form', () => {
            const application = ordersApplication();
            const screen = { ...application.screens[1], forms: [{ name: 'Place', forCommand: 'PlaceOrder', generationMode: 'auto', fields: [] } as never] };
            asComponent(screenContent(application, screen).content[2]).componentName.should.equal('commandForm');
        });
    });

    describe('and it is composed as an outlet screen', () => {
        const application = ordersApplication();

        it('should be its content alone', () => asComponent(composeOutletScreen(application, application.screens[3])).id.should.equal('tickets'));
        it('should group several elements', () => ids((composeOutletScreen(application, application.screens[1]) as unknown as { children: SceneElement[] }).children).should.deep.equal(['orders', 'order-list']));
    });

    describe('and it is composed as a dialog', () => {
        it('should wrap the template content in the template component', () => {
            const application = ordersApplication();
            const composed = asComponent(composeDialog(application, { name: 'Confirm', slots: [{ name: 'body' }], content: { body: [element('confirm-text', 'test:page')] } } as never));
            [composed.componentName, ids(composed.slots.body)].should.deep.equal([previewTemplateComponent, ['confirm-text']]);
        });
    });

    describe('and effective configuration is asked for', () => {
        it('should resolve it only when the document has contributions and the host has descriptors', () => {
            const application = ordersApplication();
            const composed = composeApplicationScreen(application, application.screens[1], { descriptors: { components: [], layoutTypes: [] } });
            (composed.configuration === undefined).should.equal(true);
        });
        it('should resolve it for the chain of the screen', () => {
            const application = ordersApplication();
            application.instanceContributions = [{ instance: 'screen:sales.orders', component: 'x', path: 'y', value: 1 } as never];
            const composed = composeApplicationScreen(application, application.screens[1], { descriptors: { components: [], layoutTypes: [] } });
            (composed.configuration !== undefined).should.equal(true);
        });
    });

    describe('and destinations are collected', () => {
        it('should find every destination wherever it sits, in screens and templates', () => {
            const application = ordersApplication();
            application.screens = [{ ...application.screens[0], slotContent: { content: [element('go', 'core:button', { destination: { screen: 'a' } })] } }];
            application.screenTemplates = [{ name: 'T', slots: [], content: { body: [element('t-go', 'core:button', { destination: { screen: 'b' } })] } }];
            collectDestinations(application).map(destination => destination.screen).should.deep.equal(['a', 'b']);
        });
    });
});

describe('when building the profile of a preview', () => {
    describe('and the document declares none', () => {
        it('should admit the packages every host renders with', () => previewProfile(undefined).packages.should.deep.equal(['core', 'Cratis.Components', 'Cratis.Blueprint.Default']));
    });

    describe('and the document declares a web profile with its own packages', () => {
        const profile = previewProfile([
            { name: 'Phone', targetPlatform: 'ios', packages: ['x'] },
            { name: 'Web', targetPlatform: 'web', packages: ['Cratis.Components'], theme: 'Dark', layout: 'AppShell', sampleData: { activePack: 'p', mappings: [], bindings: [] } },
        ], ['PrimeReact']);

        it('should choose the web profile', () => profile.name.should.equal('Web'));
        it('should order core, the baseline, the listed libraries and then the blueprint', () => profile.packages.should.deep.equal(['core', 'Cratis.Components', 'PrimeReact', 'Cratis.Blueprint.Default']));
        it('should carry the sample data selection', () => profile.sampleData!.activePack!.should.equal('p'));
        it('should carry the theme and layout', () => [profile.theme, profile.layout].should.deep.equal(['Dark', 'AppShell']));
    });
});

describe('when the layouts of the blueprint are used', () => {
    it('should provide the shell the screens name', () => defaultLayouts.map(layout => layout.name).should.include('AppShell'));
    it('should name the component that renders it', () => (ComponentName.AppShell as string).should.equal('appShell'));
});
