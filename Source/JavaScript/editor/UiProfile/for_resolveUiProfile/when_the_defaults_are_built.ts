// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { UiProfileSettings } from '../UiProfileSettings';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';

describe('when the defaults are built', () => {
    let settings: UiProfileSettings;

    beforeEach(() => {
        settings = defaultUiProfileSettings(blueprintPreviewBundles);
    });

    it('should choose the base library and styling but never core', () => {
        settings.packages.should.deep.equal(['PrimeReact', 'Tailwind']);
    });

    it('should use the first blueprint as the shell', () => {
        settings.shell.should.equal('Cratis.Blueprint.Default');
    });

    it('should add no template packs', () => {
        settings.templatePacks.should.be.empty;
    });

    it('should pick a light compatible theme', () => {
        settings.theme.should.equal('Scene Default Light');
    });

    it('should set no accent and no default screen template', () => {
        settings.accent.should.equal('');
        settings.defaultScreenTemplate.should.equal('');
    });
});
