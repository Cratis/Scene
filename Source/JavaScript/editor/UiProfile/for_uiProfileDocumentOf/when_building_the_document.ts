// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutMode } from '@cratis/scene.blueprint.default';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { StoredTemplateReference, StoredUiProfileShape } from '../StoredUiProfileShape';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { uiProfileDocumentOf } from '../uiProfileDocumentOf';

const pinned: StoredTemplateReference = { source: 'blueprint', blueprint: 'Cratis.Blueprint.Default', id: 'AppShell', version: '^4.67', isNone: false };
const ownDefault: StoredTemplateReference = { source: 'own', blueprint: '', id: 'Dashboard', version: '', isNone: false };

describe('when building the document', () => {
    const settings = { ...defaultUiProfileSettings(blueprintPreviewBundles), accent: '#336699', defaultScreenTemplate: 'Dashboard' };
    const stored: StoredUiProfileShape = {
        settings,
        root: { template: pinned, optionsJson: '{"navigationMode":"static","density":"compact"}' },
        defaults: { newScreenTemplate: ownDefault },
    };

    it('should name the shell blueprint and its layout as the root template when nothing was stored', () => {
        const document = uiProfileDocumentOf(settings, blueprintPreviewBundles);
        document.root.template.should.deep.equal({ source: 'blueprint', blueprint: settings.shell, id: 'AppShell', version: '', isNone: false });
    });

    it('should put the navigation mode in the root options', () => {
        JSON.parse(uiProfileDocumentOf(settings, blueprintPreviewBundles).root.optionsJson).navigationMode.should.equal(settings.navigationMode);
    });

    it('should carry the colour scheme and accent as the appearance', () => {
        uiProfileDocumentOf(settings, blueprintPreviewBundles).appearance.should.deep.equal({ colorScheme: settings.colorScheme, accent: '#336699' });
    });

    it('should name an own default screen template, and none when there is none', () => {
        uiProfileDocumentOf(settings, blueprintPreviewBundles).defaults.newScreenTemplate.should.deep.equal(ownDefault);
        uiProfileDocumentOf({ ...settings, defaultScreenTemplate: '' }, blueprintPreviewBundles).defaults.newScreenTemplate.isNone.should.be.true;
    });

    it('should save the stored root and defaults back as they were when their settings did not change', () => {
        const document = uiProfileDocumentOf(settings, blueprintPreviewBundles, stored);
        document.root.should.deep.equal(stored.root);
        document.defaults.should.deep.equal(stored.defaults);
    });

    it('should keep the other root options and the version pin when only the navigation mode changed', () => {
        const mode = settings.navigationMode === LayoutMode.Static ? LayoutMode.Slim : LayoutMode.Static;
        const document = uiProfileDocumentOf({ ...settings, navigationMode: mode }, blueprintPreviewBundles, stored);
        document.root.template.version.should.equal('^4.67');
        JSON.parse(document.root.optionsJson).should.deep.equal({ navigationMode: mode, density: 'compact' });
    });

    it('should replace the stored root when the shell changed', () => {
        const document = uiProfileDocumentOf({ ...settings, shell: '' }, blueprintPreviewBundles, stored);
        document.root.template.isNone.should.be.true;
    });

    it('should keep the resolved package order beside the choices', () => {
        uiProfileDocumentOf(settings, blueprintPreviewBundles).resolvedPackages.should.contain('core');
    });
});
