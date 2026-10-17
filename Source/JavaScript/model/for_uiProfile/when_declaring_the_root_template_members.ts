// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    ColorScheme,
    CornerStyle,
    LogoKind,
    ProfileIdentityPropertyNames,
    ProfileLogoPropertyNames,
    ProfileAppearancePropertyNames,
    ProfileDefaultsPropertyNames,
    RootTemplatePropertyNames,
    UiProfile,
    UiProfilePropertyNames,
} from '../index';

describe('when declaring the root template members', () => {
    it('should expose root, appearance and defaults on the profile', () => {
        UiProfilePropertyNames.should.include.members(['root', 'appearance', 'defaults']);
    });

    it('should keep the legacy layout on the profile', () => {
        UiProfilePropertyNames.should.include('layout');
    });

    it('should expose the template and options on the root template', () => {
        RootTemplatePropertyNames.should.have.members(['template', 'options']);
    });

    it('should expose the colour scheme, accent, corners and font on the appearance', () => {
        ProfileAppearancePropertyNames.should.have.members(['colorScheme', 'accent', 'corners', 'font']);
    });

    it('should expose the name, logo and name visibility on the identity', () => {
        ProfileIdentityPropertyNames.should.have.members(['name', 'logo', 'showName']);
    });

    it('should expose the kind, initials, icon and image on the logo', () => {
        ProfileLogoPropertyNames.should.have.members(['kind', 'initials', 'icon', 'image']);
    });

    it('should offer sharp, default and round corners', () => {
        Object.values(CornerStyle).should.deep.equal(['Sharp', 'Default', 'Round']);
    });

    it('should offer initials, icon and image logos', () => {
        Object.values(LogoKind).should.deep.equal(['Initials', 'Icon', 'Image']);
    });

    it('should expose the new screen template on the defaults', () => {
        ProfileDefaultsPropertyNames.should.have.members(['newScreenTemplate']);
    });

    it('should offer light, dark and system colour schemes', () => {
        Object.values(ColorScheme).should.have.members(['Light', 'Dark', 'System']);
    });

    it('should not require any of the new members', () => {
        const profile: UiProfile = { name: 'Old', targetPlatform: 'web', packages: [] };
        (profile.root === undefined && profile.appearance === undefined && profile.defaults === undefined).should.be.true;
    });
});
