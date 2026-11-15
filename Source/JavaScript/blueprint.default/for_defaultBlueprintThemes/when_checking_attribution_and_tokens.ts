// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultDesignSystem, incompatiblePackages, tokenAddress } from '@cratis/scene.engine';
import { designAnatomyProperty, designTokenProperty } from '@cratis/scene.react';
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

    it('should define exactly the same token roles in both themes', () => {
        Object.keys(lightTheme.tokens ?? {})
            .sort()
            .should.deep.equal(Object.keys(darkTheme.tokens ?? {}).sort());
    });

    it('should ship one light and one dark theme', () => {
        defaultBlueprintThemes.filter(theme => theme.isDark === true).should.have.lengthOf(1);
        defaultBlueprintThemes.filter(theme => theme.isDark !== true).should.have.lengthOf(1);
    });

    it('should give every role of the default design system a value in both themes', () => {
        const roles = defaultDesignSystem.tokens.map(tokenAddress).sort();
        Object.keys(lightTheme.tokens ?? {}).sort().should.deep.equal(roles);
        Object.keys(darkTheme.tokens ?? {}).sort().should.deep.equal(roles);
    });

    it('should name the custom properties the stylesheet reads', () => {
        designTokenProperty('color.on-primary').should.equal('--ds-token-color-on-primary');
        designAnatomyProperty('Menu', 'default', 'background', 'selected').should.equal('--ds-menu-default-background-selected');
        designAnatomyProperty('StatusChip', 'success', 'text').should.equal('--ds-status-chip-success-text');
    });
});
