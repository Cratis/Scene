// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LogoKind } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import type { PersistedUiProfile } from '../PersistedUiProfile';
import { persistedFromSettings } from '../persistedFromSettings';
import { toSceneUiProfile } from '../toSceneUiProfile';
import { withStoredLook } from '../withStoredLook';

const settings = { ...defaultUiProfileSettings(blueprintPreviewBundles), accent: '#c2410c' };
const persisted: PersistedUiProfile = persistedFromSettings(settings, blueprintPreviewBundles);
const profile = toSceneUiProfile(persisted);
const root = { template: { source: 'blueprint', blueprint: 'Cratis.Blueprint.Default', id: 'AppShell', version: '^1', isNone: false }, optionsJson: JSON.stringify({ navigationMode: 'horizontal', menuTheme: 'dark' }) };
const style = { identity: { name: 'Acme Shop', logoKind: 'image', initials: '', icon: '', image: 'data:image/svg+xml;base64,PHN2Zy8+', showName: true }, corners: 'round', font: '' };

describe('when the application stored no look beside the legacy members', () => {
    it('should leave the profile as it is', () => withStoredLook(profile, persisted, undefined).should.equal(profile));
    it('should leave the profile as it is when the look is empty', () => withStoredLook(profile, persisted, { style: null }).should.equal(profile));
});

describe('when the application stored its look', () => {
    const looked = withStoredLook(profile, persisted, { root, style });

    it('should draw with the accent', () => looked.appearance!.accent!.should.equal('#c2410c'));
    it('should draw with the corners', () => String(looked.appearance!.corners).toLowerCase().should.equal('round'));
    it('should show the name', () => looked.identity!.name!.should.equal('Acme Shop'));
    it('should show the logo image', () => looked.identity!.logo!.kind!.should.equal(LogoKind.Image));
    it('should open the shell in the stored menu mode', () => looked.root!.options!.navigationMode!.should.equal('horizontal'));
    it('should draw the stored menu theme', () => looked.root!.options!.menuTheme!.should.equal('dark'));
    it('should keep the packages and theme of the legacy members', () => looked.packages.should.deep.equal(profile.packages));
});
