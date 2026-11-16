// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutMode } from '@cratis/scene.blueprint.default';
import { CornerStyle, LogoKind } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { styleOf, withStoredStyle } from '../profileStyle';
import { uiProfileDocumentOf } from '../uiProfileDocumentOf';
import { withStoredRoot } from '../withStoredRoot';
import { areUiProfileSettingsEqual } from '../areUiProfileSettingsEqual';

const settings = defaultUiProfileSettings(blueprintPreviewBundles);
const styled = {
    ...settings,
    identity: { name: 'Fjord Books', logo: { kind: LogoKind.Icon, icon: 'database' }, showName: false },
    corners: CornerStyle.Round,
    font: 'inter',
    menuTheme: 'primary',
    navigationMode: LayoutMode.SlimPlus,
};

describe('when the profile chose nothing of the new members', () => {
    it('should store empty members that Scene reads as its defaults', () => styleOf(settings).should.deep.equal({
        identity: { name: '', logoKind: '', initials: '', icon: '', image: '', showName: true }, corners: '', font: '',
    }));
    it('should read back nothing', () => withStoredStyle(settings, styleOf(settings)).should.deep.equal(settings));
    it('should leave a profile stored before the style as it is', () => withStoredStyle(settings, undefined).should.equal(settings));
    it('should leave a profile whose style the server returned as null as it is', () => withStoredStyle(settings, null).should.equal(settings));
});

describe('when the profile chose an identity, corners and a font', () => {
    const stored = styleOf(styled);

    it('should store the logo kind in lower case', () => stored.identity.logoKind.should.equal('icon'));
    it('should store the icon', () => stored.identity.icon.should.equal('database'));
    it('should store that the name is hidden', () => stored.identity.showName.should.be.false);
    it('should store the corners and the font', () => [stored.corners, stored.font].should.deep.equal(['round', 'inter']));
    it('should read back the identity, corners and font', () => {
        const read = withStoredStyle(settings, stored);
        [read.identity, read.corners, read.font].should.deep.equal([styled.identity, CornerStyle.Round, 'inter']);
    });
    it('should drop a corner style this build does not know', () => (withStoredStyle(settings, { ...stored, corners: 'pointy' }).corners === undefined).should.be.true);
    it('should be a change when only the identity differs', () => areUiProfileSettingsEqual(settings, { ...settings, identity: styled.identity }).should.be.false);
    it('should be a change when only the menu theme differs', () => areUiProfileSettingsEqual(settings, { ...settings, menuTheme: 'dark' }).should.be.false);
});

describe('when the profile is stored with a menu theme and the Slim+ mode', () => {
    const document = uiProfileDocumentOf(styled, blueprintPreviewBundles);
    const options = JSON.parse(document.root.optionsJson);

    it('should spell the mode the typed way', () => options.navigationMode.should.equal('slimPlus'));
    it('should store the menu theme beside it', () => options.menuTheme.should.equal('primary'));
    it('should carry the style in the document', () => document.style.should.deep.equal(styleOf(styled)));
    it('should read the mode back as the legacy spelling the shell uses', () => {
        const read = withStoredRoot(settings, document.root);
        [read.navigationMode, read.menuTheme].should.deep.equal([LayoutMode.SlimPlus, 'primary']);
    });
    it('should read a mode stored the old way', () => withStoredRoot(settings, { ...document.root, optionsJson: '{"navigationMode":"slim-plus"}' }).navigationMode.should.equal(LayoutMode.SlimPlus));
    it('should keep the stored options when nothing about the mode changed', () => {
        const stored = { settings: withStoredRoot(settings, document.root), root: document.root };
        uiProfileDocumentOf(stored.settings, blueprintPreviewBundles, stored).root.optionsJson.should.equal(document.root.optionsJson);
    });
});
