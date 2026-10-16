// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PropertyDescriptor, PropertyValueType, Theme, UiProfile, UiProfilePropertyNames } from '@cratis/scene.model';
import { UiProfileNodeKind, describeUiProfile, shellOptionPath, validateComponentDescriptors } from '../index';

const profile: UiProfile = { name: 'Desktop', targetPlatform: 'web', packages: ['core', 'crm'] };
const themes: Theme[] = [
    { name: 'Aurora', compatibleWith: ['core', 'crm'], description: 'Calm blues' },
    { name: 'Slate', compatibleWith: ['core'] },
];
const nodeOf = (descriptors: ComponentDescriptor[], kind: string) => descriptors.find(descriptor => descriptor.component === kind)!;
const pathsOf = (descriptor: ComponentDescriptor) => descriptor.properties.map(property => property.path);
const allProperties = (descriptors: ComponentDescriptor[]) => descriptors.flatMap(descriptor => descriptor.properties);

describe('when describing the nodes of a profile', () => {
    const descriptors = describeUiProfile(profile);

    it('should describe the application, shell, theme, packages and sample data in that order', () =>
        descriptors.map(descriptor => descriptor.component).should.deep.equal(Object.values(UiProfileNodeKind)));

    it('should be valid component descriptors', () => validateComponentDescriptors(descriptors).should.deep.equal([]));

    it('should give every property a label, a group and a description', () =>
        allProperties(descriptors).filter(property => !property.label || !property.group || !property.description).map(property => property.path).should.deep.equal([]));

    it('should not describe a path twice', () => {
        const paths = allProperties(descriptors).map(property => property.path);
        paths.length.should.equal(new Set(paths).size);
    });

    it('should cover every setting of the profile', () => {
        const covered = new Set(allProperties(descriptors).map(property => property.path.split('.')[0]));
        UiProfilePropertyNames.filter(name => name !== 'layout' && !covered.has(name)).should.deep.equal([]);
    });

    it('should describe the colour scheme with the choices the model has', () =>
        nodeOf(descriptors, UiProfileNodeKind.Theme).properties.find(property => property.path === 'appearance.colorScheme')!.choices!.map(choice => choice.value).should.deep.equal(['Light', 'Dark', 'System']));

    it('should describe the default size class with its choices and a default', () => {
        const property = nodeOf(descriptors, UiProfileNodeKind.Application).properties.find(candidate => candidate.path === 'defaultSizeClass')!;
        [property.choices!.map(choice => choice.value), property.default].should.deep.equal([['Compact', 'Regular', 'Expanded'], 'Regular']);
    });

    it('should require a name and at least one package', () => {
        const required = allProperties(descriptors).filter(property => property.constraints?.required).map(property => property.path);
        required.should.include.members(['name', 'targetPlatform', 'packages']);
    });

    it('should only accept a colour for the accent', () => {
        const accent = allProperties(descriptors).find(property => property.path === 'appearance.accent')!;
        const pattern = new RegExp(accent.constraints!.pattern!);
        [pattern.test('#4f46e5'), pattern.test('#fff'), pattern.test('indigo'), pattern.test('#12')].should.deep.equal([true, true, false, false]);
    });

    it('should offer only the root template when no shell options are known', () => pathsOf(nodeOf(descriptors, UiProfileNodeKind.Shell)).should.deep.equal(['root.template']));
});

describe('when describing a profile with the choices of the application', () => {
    const shellOptions: PropertyDescriptor[] = [
        { path: 'density', label: 'Density', group: '', valueType: PropertyValueType.Enum, choices: [{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }] },
        { path: 'navigationMode', label: 'ignored duplicate', group: 'x', valueType: PropertyValueType.String },
    ];
    const descriptors = describeUiProfile(profile, {
        themes,
        packages: ['core', 'crm', 'hr'],
        targetPlatforms: ['web', 'desktop'],
        sampleDataPacks: [{ id: 'nordic-smb', title: 'CRM · Nordic SMB' }],
        shellOptions,
        navigationModes: ['Sidebar', 'Top'],
    });

    it('should offer the shell options under root.options', () =>
        pathsOf(nodeOf(descriptors, UiProfileNodeKind.Shell)).should.deep.equal(['root.template', shellOptionPath('navigationMode'), shellOptionPath('density')]));

    it('should offer the navigation modes as a choice', () =>
        nodeOf(descriptors, UiProfileNodeKind.Shell).properties[1].choices!.map(choice => choice.value).should.deep.equal(['Sidebar', 'Top']));

    it('should give an option without a group the shell options group', () => nodeOf(descriptors, UiProfileNodeKind.Shell).properties[2].group.should.equal('Shell options'));

    it('should offer every theme and say why one does not fit, with names', () => {
        const choices = nodeOf(descriptors, UiProfileNodeKind.Theme).properties[0].choices!;
        [choices.map(choice => choice.value), choices[0].description, choices[1].description].should.deep.equal([
            ['Aurora', 'Slate'], 'Calm blues', "Theme 'Slate' is not marked compatible with 'crm', which this profile uses",
        ]);
    });

    it('should offer the packages and the sample-data packs by title', () => {
        const packs = nodeOf(descriptors, UiProfileNodeKind.SampleData).properties[0].choices!;
        [nodeOf(descriptors, UiProfileNodeKind.Packages).properties[0].choices!.map(choice => choice.value), packs[0].label].should.deep.equal([['core', 'crm', 'hr'], 'CRM · Nordic SMB']);
    });

    it('should make the target platform a choice', () => nodeOf(descriptors, UiProfileNodeKind.Application).properties[1].valueType.should.equal(PropertyValueType.Enum));

    it('should be valid component descriptors', () => validateComponentDescriptors(descriptors).should.deep.equal([]));

    it('should never leave a placeholder in a description', () =>
        allProperties(descriptors).flatMap(property => [property.description ?? '', ...(property.choices ?? []).map(choice => choice.description ?? '')]).filter(text => /[{}]|undefined/.test(text)).should.deep.equal([]));
});
