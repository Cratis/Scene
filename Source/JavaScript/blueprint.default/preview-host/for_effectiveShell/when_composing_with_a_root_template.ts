// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, Layout, SceneElement, ScreenTemplate, TemplateReferenceSource, TemplateRole } from '@cratis/scene.model';
import { ShellKind, ShellOrigin } from '@cratis/scene.engine';
import { ApplicationDocument } from '../ApplicationDocument';
import { composeApplicationScreen, effectiveShellOf } from '../composeApplication';
import { previewTemplateComponent } from '../PreviewTemplate';
import { element, ordersApplication } from '../for_ScenePreviewHost/given';

const asComponent = (value: SceneElement) => value as ExternalComponent;
const slotNames = (value: SceneElement) => Object.keys(asComponent(value).slots).sort();

function withRoot(root: NonNullable<ApplicationDocument['uiProfiles']>[number]['root'], layouts: Layout[] = [], templates: ScreenTemplate[] = []): ApplicationDocument {
    const application = ordersApplication();
    application.layouts = [...application.layouts, ...layouts];
    application.screenTemplates = templates;
    application.uiProfiles = [{ ...application.uiProfiles![0], root }];
    return application;
}

describe('when composing with a root template', () => {
    describe('and the root is the blueprint app shell', () => {
        const application = withRoot({ template: { source: TemplateReferenceSource.Own, id: 'AppShell' } });
        const composed = composeApplicationScreen(application, { ...application.screens[1], layout: 'AppShell' });

        it('should resolve the shell from the root', () => effectiveShellOf(application, application.screens[1]).origin.should.equal(ShellOrigin.Root));
        it('should draw the shell component', () => asComponent(composed.element).componentName.should.equal('Cratis.Blueprint.Default:appShell'));
    });

    describe('and a screen names another layout', () => {
        const application = withRoot({ template: { source: TemplateReferenceSource.Own, id: 'AppShell' } });
        const composed = composeApplicationScreen(application, { ...application.screens[1], layout: 'SomethingElse' });

        it('should still be inside the application shell the root names', () => asComponent(composed.element).componentName.should.equal('Cratis.Blueprint.Default:appShell'));
    });

    describe('and a screen opts out with the full page layout', () => {
        const application = withRoot({ template: { source: TemplateReferenceSource.Own, id: 'AppShell' } });
        const composed = composeApplicationScreen(application, { ...application.screens[0], layout: 'FullPage' });

        it('should have no chrome', () => [asComponent(composed.element).componentName, slotNames(composed.element)].should.deep.equal(['Cratis.Blueprint.Default:fullPageShell', ['content']]));
    });

    describe('and the root names a template that does not exist', () => {
        const application = withRoot({ template: { source: TemplateReferenceSource.Own, id: 'Nope' } });

        it('should fall back to the default blueprint shell and report it', () => {
            const shell = effectiveShellOf(application, application.screens[1]);
            [shell.origin, shell.diagnostics.map(diagnostic => diagnostic.code)].should.deep.equal([ShellOrigin.BlueprintDefault, ['rootTemplateUnknown']]);
        });
    });

    describe('and the root is a screen template with the root role and its own primary outlet', () => {
        const frame: ScreenTemplate = {
            name: 'Frame', slots: [{ name: 'rail' }, { name: 'main' }], content: { rail: [element('frame-rail', 'test:page')] },
            metadata: { role: TemplateRole.Root, primaryOutlet: 'main' },
        };
        const application = withRoot({ template: { source: TemplateReferenceSource.Own, id: 'Frame' } }, [], [frame]);
        const composed = composeApplicationScreen(application, application.screens[1]);

        it('should be a screen template shell', () => effectiveShellOf(application, application.screens[1]).kind.should.equal(ShellKind.ScreenTemplate));
        it('should be drawn by the template component', () => asComponent(composed.element).componentName.should.equal(previewTemplateComponent));
        it('should keep the template content in its rail', () => (asComponent(composed.element).slots.rail ?? []).map(value => (value as ExternalComponent).id).should.include('frame-rail'));
        it('should place the screen in the primary outlet', () => (asComponent(composed.element).slots.main ?? []).map(value => (value as ExternalComponent).id).should.include('orders'));
    });

    describe('and the root screen template fills its own topbar', () => {
        const shop: ScreenTemplate = {
            name: 'ShopFrame', slots: [{ name: 'topbar' }, { name: 'breadcrumb' }, { name: 'content' }], content: { topbar: [element('shop-topbar', 'test:topbar')] },
            metadata: { role: TemplateRole.Root, primaryOutlet: 'content' },
        };
        const application = withRoot({ template: { source: TemplateReferenceSource.Own, id: 'ShopFrame' } }, [], [shop]);
        const composed = composeApplicationScreen(application, application.screens[1]);
        const ids = (slot: string) => (asComponent(composed.element).slots[slot] ?? []).map(value => (value as ExternalComponent).id);

        it('should draw what the template put in the topbar instead of the default chrome', () => ids('topbar').should.deep.equal(['shop-topbar']));
        it('should still seed the slots the template leaves empty with the default chrome', () => ids('breadcrumb').should.deep.equal(['breadcrumb']));
    });

    describe('and the profile has no root', () => {
        const application = ordersApplication();

        it('should resolve the screen layout as the legacy shell', () => effectiveShellOf(application, application.screens[1]).origin.should.equal(ShellOrigin.LegacyLayout));
    });
});
