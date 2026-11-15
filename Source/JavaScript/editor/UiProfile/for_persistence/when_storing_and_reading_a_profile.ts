// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme, LayoutMode } from '@cratis/scene.blueprint.default';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { PersistedUiProfile } from '../PersistedUiProfile';
import { areUiProfileSettingsEqual } from '../areUiProfileSettingsEqual';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { persistedFromSettings } from '../persistedFromSettings';
import { settingsFromPersisted } from '../settingsFromPersisted';
import { toSceneUiProfile } from '../toSceneUiProfile';

describe('when storing and reading a profile', () => {
    const settings = { ...defaultUiProfileSettings(blueprintPreviewBundles), templatePacks: ['Cratis.Blueprint.Components'], accent: '#336699' };
    let persisted: PersistedUiProfile;

    beforeEach(() => {
        persisted = persistedFromSettings(settings, blueprintPreviewBundles);
    });

    it('should store the resolved order and the shell layout beside the choices', () => {
        persisted.resolvedPackages.should.deep.equal(['core', 'Tailwind', 'Cratis.Components', 'PrimeReact', 'Cratis.Blueprint.Default', 'Cratis.Blueprint.Components']);
        persisted.layout.should.equal('AppShell');
    });

    it('should read back the same choices', () => {
        areUiProfileSettingsEqual(settingsFromPersisted(persisted), settings).should.be.true;
    });

    it('should fall back to defaults for a color scheme or navigation mode it does not know', () => {
        const read = settingsFromPersisted({ ...persisted, colorScheme: 'sepia', navigationMode: 'holographic' });
        read.colorScheme.should.equal(ColorScheme.Light);
        read.navigationMode.should.equal(LayoutMode.Static);
    });

    it('should build the Scene profile from the stored one without a catalog', () => {
        const profile = toSceneUiProfile(persisted);
        profile.packages.should.deep.equal(persisted.resolvedPackages);
        profile.layout!.should.equal('AppShell');
        profile.theme!.should.equal(settings.theme);
    });

    it('should tell a changed priority apart from an unchanged one', () => {
        areUiProfileSettingsEqual(settings, { ...settings, packages: [...settings.packages].reverse() }).should.be.false;
        areUiProfileSettingsEqual(settings, { ...settings }).should.be.true;
    });
});
