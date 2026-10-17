// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ColorScheme, ScenePackage, Theme, UiProfile } from '@cratis/scene.model';
import { TemplateLibrary, describeOwnShellValue, describeShellCards, describeThemeCards, describeVersionRule, switchColorScheme } from '../index';

type Scheme = ColorScheme.Light | ColorScheme.Dark;
const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../profile-pickers-fixtures.json'), 'utf-8')) as {
    themes: Theme[];
    packages: ScenePackage[];
    themeCards: { name: string; profile: UiProfile; scheme?: Scheme; expected: unknown }[];
    colorSchemeSwitch: { name: string; profile: UiProfile; scheme: Scheme; expected: unknown }[];
    versionRules: { name: string; pin?: string; installed: string; latest?: string; expected: unknown }[];
    ownShell: { value: string; expected: unknown }[];
    shellCards: { name: string; library: TemplateLibrary; expected: unknown }[];
};

const plain = (value: unknown) => JSON.parse(JSON.stringify(value));

describe('when checking the pickers against the shared fixture corpus', () => {
    for (const fixture of corpus.themeCards) {
        it(`should describe the theme cards: ${fixture.name}`, () => plain(describeThemeCards(fixture.profile, corpus.themes, corpus.packages, fixture.scheme)).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.colorSchemeSwitch) {
        it(`should switch the colour scheme: ${fixture.name}`, () => plain(switchColorScheme(fixture.profile, fixture.scheme, corpus.themes)).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.versionRules) {
        it(`should describe the version rule: ${fixture.name}`, () => plain(describeVersionRule(fixture.pin, fixture.installed, fixture.latest)).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.ownShell) {
        it(`should describe the value '${fixture.value}' of my own shell`, () => plain(describeOwnShellValue(fixture.value)).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.shellCards) {
        it(`should describe the shell cards: ${fixture.name}`, () => plain(describeShellCards(fixture.library)).should.deep.equal(fixture.expected));
    }
});
