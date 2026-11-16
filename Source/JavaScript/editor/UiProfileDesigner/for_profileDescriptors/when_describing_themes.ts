// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Theme } from '@cratis/scene.model';
import { themeDescriptor, type ThemeChoice } from '../Properties/profileDescriptors';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

const strings = { properties: { theme: 'Theme', themeDescription: 'about', themeIncompatible: 'Not made for {packages}' }, nodes: { theme: 'Theme' } } as unknown as UiProfileDesignerStrings;
const profile = { name: 'p', targetPlatform: 'web', packages: ['core', 'crm'] };
const themes: Theme[] = [
    { name: 'Fits', compatibleWith: ['core', 'crm'] },
    { name: 'Core only', compatibleWith: ['core'] },
    { name: 'Neither', compatibleWith: [] },
];

describe('when describing the themes of a profile', () => {
    const choices = themeDescriptor(strings, themes, profile).choices as unknown as ThemeChoice[];
    const reasonOf = (name: string) => choices.find(choice => choice.value === name)!.disabledReason;

    it('should list every theme, so none disappears without a reason', () => choices.map(choice => choice.value).should.have.members(['Fits', 'Core only', 'Neither']));
    it('should list the themes that can be chosen first', () => choices[0].value.should.equal('Fits'));
    it('should leave a compatible theme choosable', () => (reasonOf('Fits') === undefined).should.be.true);
    it('should name the package a theme is not made for', () => reasonOf('Core only')!.should.equal('Not made for crm'));
    it('should name every package a theme is not made for', () => reasonOf('Neither')!.should.equal('Not made for core, crm'));
    it('should be drawn by the select editor', () => themeDescriptor(strings, themes, profile).editorKind!.should.equal('select'));
});
