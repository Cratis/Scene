// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { incompatiblePackages } from '@cratis/scene.engine';
import { themeTokenProperty } from '@cratis/scene.react';
import { galleryProfile } from '../gallery';
import { darkTheme, defaultBlueprintThemes, lightTheme } from '../themes';

describe('when checking attribution and tokens', () => {
    for (const theme of defaultBlueprintThemes) {
        describe(`and the theme is '${theme.name}'`, () => {
            it('should say who made it', () => {
                (theme.author ?? '').should.not.be.empty;
            });

            it('should link to them', () => {
                (theme.authorUrl ?? '').should.not.be.empty;
            });

            it('should state the license it is used under', () => {
                (theme.license ?? '').should.not.be.empty;
            });

            it('should be compatible with every package the gallery profile activates', () => {
                incompatiblePackages(theme, galleryProfile).should.be.empty;
            });

            it('should declare compatibility with core, which gets no implicit exemption', () => {
                theme.compatibleWith.should.contain('core');
            });
        });
    }

    it('should define exactly the same token names in both themes', () => {
        Object.keys(lightTheme.tokens ?? {})
            .sort()
            .should.deep.equal(Object.keys(darkTheme.tokens ?? {}).sort());
    });

    it('should ship one light and one dark theme', () => {
        defaultBlueprintThemes.filter(theme => theme.isDark === true).should.have.lengthOf(1);
        defaultBlueprintThemes.filter(theme => theme.isDark !== true).should.have.lengthOf(1);
    });

    it('should name tokens that become the custom properties the stylesheet reads', () => {
        themeTokenProperty('primary.contrastColor').should.equal('--scene-primary-contrast-color');
        themeTokenProperty('text.mutedColor').should.equal('--scene-text-muted-color');
        themeTokenProperty('content.borderRadius').should.equal('--scene-content-border-radius');
    });
});
