// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { incompatiblePackages } from '@cratis/scene.engine';
import { UiProfile } from '@cratis/scene.model';
import { primeReactThemes } from '../theme';

describe('when checking compatibility', () => {
    const profile: UiProfile = { name: 'web', targetPlatform: 'web', packages: ['core', 'PrimeReact', 'Tailwind'] };

    it('should declare every theme compatible with PrimeReact', () => {
        primeReactThemes.filter((theme) => !theme.compatibleWith.includes('PrimeReact')).should.deep.equal([]);
    });

    it('should declare every theme compatible with Tailwind', () => {
        primeReactThemes.filter((theme) => !theme.compatibleWith.includes('Tailwind')).should.deep.equal([]);
    });

    it('should declare every theme compatible with core, which gets no implicit exemption', () => {
        primeReactThemes.filter((theme) => !theme.compatibleWith.includes('core')).should.deep.equal([]);
    });

    it('should report no incompatibility for a profile listing all three', () => {
        primeReactThemes.flatMap((theme) => incompatiblePackages(theme, profile)).should.deep.equal([]);
    });
});
