// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyDescriptor, Theme } from '@cratis/scene.model';
import { describeUiProfile } from '@cratis/scene.engine';
import {
    accentDescriptor, accentPath, colorSchemeDescriptor, colorSchemePath, namePath, nameDescriptor, newScreenTemplateDescriptor, newScreenTemplatePath,
    sampleDataDescriptor, sampleDataPath, sizeClassDescriptor, sizeClassPath, targetPlatformDescriptor, themeDescriptor, themePath, targetPlatformPath,
} from '../Properties/profileDescriptors';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

// Scene owns what the profile's properties are (Cratis/Scene#160, `describeUiProfile`); Studio words them for its own locale and draws them. This keeps the two
// from drifting: every property the designer draws is one Scene publishes at the same path, of the same value type, with the same choices and required-ness.
const strings = new Proxy({}, { get: () => new Proxy({}, { get: (_, key) => String(key) }) }) as unknown as UiProfileDesignerStrings;
const profile = { name: 'p', targetPlatform: 'web', packages: ['core'] };
const themes: Theme[] = [{ name: 'Fits', compatibleWith: ['core'] }];

describe('when comparing the designer\'s property descriptors with the engine\'s', () => {
    const engine = describeUiProfile(profile, { themes, targetPlatforms: ['web'], sampleDataPacks: [{ id: 'p', title: 'P' }] }).flatMap(node => node.properties ?? []);
    const engineAt = (path: string): PropertyDescriptor => engine.find(property => property.path === path)!;

    const studio: [string, PropertyDescriptor][] = [
        [namePath, nameDescriptor(strings)],
        [targetPlatformPath, targetPlatformDescriptor(strings)],
        [newScreenTemplatePath, newScreenTemplateDescriptor(strings)],
        [themePath, themeDescriptor(strings, themes, profile)],
        [colorSchemePath, colorSchemeDescriptor(strings)],
        [accentPath, accentDescriptor(strings)],
        [sampleDataPath, sampleDataDescriptor(strings)],
        [sizeClassPath, sizeClassDescriptor(strings)],
    ];

    studio.forEach(([path]) => it(`should find ${path} among the engine's properties`, () => (engineAt(path) !== undefined).should.be.true));

    // The template and the active pack are values the settings keep as a name or an id (the document stores them as a reference), so only the editors are compared for those.
    [namePath, targetPlatformPath, themePath, colorSchemePath, accentPath, sizeClassPath].forEach(path =>
        it(`should give ${path} the engine's value type`, () => studio.find(([key]) => key === path)![1].valueType.should.equal(engineAt(path).valueType)));

    // The engine names the schemes by their enum members (Light, Dark, System) while the stored profile spells them in lower case; Studio offers the first two until a
    // profile can store a system scheme through the designer.
    it('should offer colour schemes the engine knows', () => {
        const engineValues = (engineAt(colorSchemePath).choices ?? []).map(choice => String(choice.value).toLowerCase());
        (colorSchemeDescriptor(strings).choices ?? []).map(choice => String(choice.value)).forEach(value => engineValues.should.include(value));
    });

    // The engine names the classes by their enum members (Compact, Regular, Expanded); the stored profile and the Screenplay `target size` line spell them in lower case.
    it('should offer exactly the size classes the engine knows', () => {
        const engineValues = (engineAt(sizeClassPath).choices ?? []).map(choice => String(choice.value).toLowerCase());
        (sizeClassDescriptor(strings).choices ?? []).map(choice => String(choice.value)).should.deep.equal(engineValues);
    });

    it('should require what the engine requires', () => {
        [namePath, targetPlatformPath].forEach(path => Boolean(studio.find(([key]) => key === path)![1].constraints?.required).should.equal(Boolean(engineAt(path).constraints?.required)));
    });

    it('should draw the template and colour properties with the editors the engine names', () => {
        (newScreenTemplateDescriptor(strings).editorKind ?? '').should.equal(engineAt(newScreenTemplatePath).editorKind);
        (accentDescriptor(strings).editorKind ?? '').should.equal(engineAt(accentPath).editorKind);
        (sampleDataDescriptor(strings).editorKind ?? '').should.not.equal('');
    });
});
