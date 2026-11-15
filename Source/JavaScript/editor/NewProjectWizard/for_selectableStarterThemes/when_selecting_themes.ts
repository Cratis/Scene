// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme, UiStarter } from '@cratis/scene.model';
import { selectableStarterThemes } from '../selectableStarterThemes';

describe('when selecting themes', () => {
    let result: Theme[];

    beforeEach(() => {
        const starter: UiStarter = { name: 'Admin', packages: ['core', 'PrimeReact'], themes: ['Aurora', 'Midnight'], gallery: [] };
        const themes: Record<string, Theme> = {
            Aurora: { name: 'Aurora', compatibleWith: ['core', 'PrimeReact'] },
            Midnight: { name: 'Midnight', compatibleWith: ['core'] },
        };

        result = selectableStarterThemes(starter, themes);
    });

    it('should include a theme compatible with the starter\'s packages', () => {
        result.map(theme => theme.name).should.contain('Aurora');
    });

    it('should exclude a theme incompatible with the starter\'s packages', () => {
        result.map(theme => theme.name).should.not.contain('Midnight');
    });
});
