// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutMode } from '@cratis/scene.blueprint.default';
import { TemplateReferenceSource } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { StoredTemplateReference } from '../StoredUiProfileShape';
import { uiProfileDocumentOf } from '../uiProfileDocumentOf';
import { withStoredRoot } from '../withStoredRoot';

const defaultBlueprint = 'Cratis.Blueprint.Default';
const settings = defaultUiProfileSettings(blueprintPreviewBundles);
const reference = (overrides: Partial<StoredTemplateReference>): StoredTemplateReference => ({ source: 'blueprint', blueprint: defaultBlueprint, id: 'FullPage', version: '^1.0.0', isNone: false, ...overrides });

describe('when the profile stored no root template', () => {
    it('should be read as the legacy members say', () => withStoredRoot(settings, undefined).should.equal(settings));
    it('should leave the bare shell as it is', () => withStoredRoot(settings, { template: reference({ source: '', blueprint: '', id: '', version: '', isNone: true }), optionsJson: '{}' }).should.equal(settings));
});

describe('when the profile stored a root template', () => {
    const read = withStoredRoot(settings, { template: reference({}), optionsJson: JSON.stringify({ showFooter: false, navigationMode: LayoutMode.Overlay }) });

    it('should read the template with its pin', () => read.root!.template.should.deep.equal({ source: TemplateReferenceSource.Blueprint, id: 'FullPage', blueprint: defaultBlueprint, version: '^1.0.0' }));
    it('should read the options of the shell', () => read.root!.options!.should.deep.equal({ showFooter: false, navigationMode: LayoutMode.Overlay }));
    it('should name the blueprint as the shell', () => read.shell.should.equal(defaultBlueprint));
    it('should read the navigation mode from the options', () => read.navigationMode.should.equal(LayoutMode.Overlay));
    it('should store back what it read', () => {
        const document = uiProfileDocumentOf(read, blueprintPreviewBundles);
        document.root.template.should.deep.equal(reference({}));
        JSON.parse(document.root.optionsJson).should.deep.equal({ showFooter: false, navigationMode: LayoutMode.Overlay });
    });
});

describe('when the stored options are not an object', () => {
    const read = withStoredRoot(settings, { template: reference({ id: 'AppShell', version: '' }), optionsJson: '[1,2]' });

    it('should read none', () => read.root!.options!.should.deep.equal({}));
    it('should keep the navigation mode the legacy members hold', () => read.navigationMode.should.equal(settings.navigationMode));
});

describe('when the stored root is the application\'s own template', () => {
    const read = withStoredRoot(settings, { template: reference({ source: 'own', blueprint: '', id: 'abc', version: '' }), optionsJson: '{}' });

    it('should read it as an own template', () => read.root!.template.source.should.equal(TemplateReferenceSource.Own));
    it('should have no blueprint as the shell', () => read.shell.should.equal(''));
});
