// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Theme } from '@cratis/scene.model';
import { profileTheme } from '../profileTheme';

const theme = (name: string) => ({ name }) as Theme;
const runtime = (profileThemeName: string | undefined, ...themes: Theme[]) =>
    ({ bundles: [{ themes: themes.slice(0, 1) }, { themes: themes.slice(1) }, {}], profile: { theme: profileThemeName } }) as never;

describe('when the profile names a theme a package ships', () => {
    it('should use that theme, from whichever package ships it', () => profileTheme(runtime('Dark', theme('Light'), theme('Dark')))!.name.should.equal('Dark'));
});

describe('when the profile names no theme', () => {
    it('should use the first theme a package ships', () => profileTheme(runtime(undefined, theme('Light'), theme('Dark')))!.name.should.equal('Light'));
});

describe('when the profile names a theme no package ships', () => {
    it('should use the first theme a package ships', () => profileTheme(runtime('Gone', theme('Light')))!.name.should.equal('Light'));
});

describe('when no package ships a theme', () => {
    it('should choose none', () => (profileTheme(runtime('Light')) === undefined).should.be.true);
});

describe('when the host gives the editor an appearance', () => {
    const hostTheme = theme('Host');
    const withAppearance = (profileThemeName: string | undefined, ...themes: Theme[]) => ({ ...(runtime(profileThemeName, ...themes) as object), appearance: { theme: hostTheme } }) as never;

    it('should use the host theme over the one the profile names', () => profileTheme(withAppearance('Dark', theme('Light'), theme('Dark')))!.name.should.equal('Host'));
    it('should use the host theme when the profile names none', () => profileTheme(withAppearance(undefined, theme('Light')))!.name.should.equal('Host'));
    it('should use the host theme when no package ships one', () => profileTheme(withAppearance(undefined))!.name.should.equal('Host'));
});
