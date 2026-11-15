// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Theme } from '@cratis/scene.model';
import { profileColorSchemeClasses } from '../profileColorScheme';

describe('when the theme is light', () => {
    it('should make the root a light Components scope', () => profileColorSchemeClasses({ isDark: false } as Theme).should.equal('cratis-theme cratis-light'));
});

describe('when the theme is dark', () => {
    it('should make the root a dark Components scope', () => profileColorSchemeClasses({ isDark: true } as Theme).should.equal('cratis-theme cratis-dark'));
});

describe('when there is no theme', () => {
    it('should add nothing', () => profileColorSchemeClasses(undefined).should.equal(''));
});
