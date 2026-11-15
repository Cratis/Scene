// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme, UiProfile } from '@cratis/scene.model';
import { filterCompatibleThemes } from '../filterCompatibleThemes';

describe('when filtering themes', () => {
    let result: Theme[];

    beforeEach(() => {
        const profile: UiProfile = { name: 'Admin', targetPlatform: 'web', packages: ['core', 'PrimeReact'] };
        const themes: Theme[] = [
            { name: 'Aurora', compatibleWith: ['core', 'PrimeReact'] },
            { name: 'Midnight', compatibleWith: ['core'] },
            { name: 'Internal', compatibleWith: ['core', 'PrimeReact', 'Internal.Widgets'] },
        ];

        result = filterCompatibleThemes(profile, themes);
    });

    it('should include a theme compatible with every active package', () => {
        result.map(theme => theme.name).should.contain('Aurora');
    });

    it('should include a theme compatible with a superset of the active packages', () => {
        result.map(theme => theme.name).should.contain('Internal');
    });

    it('should exclude a theme missing one active package', () => {
        result.map(theme => theme.name).should.not.contain('Midnight');
    });
});
