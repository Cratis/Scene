// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    ColorScheme,
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

    it('should expose the colour scheme and accent on the appearance', () => {
        ProfileAppearancePropertyNames.should.have.members(['colorScheme', 'accent']);
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
