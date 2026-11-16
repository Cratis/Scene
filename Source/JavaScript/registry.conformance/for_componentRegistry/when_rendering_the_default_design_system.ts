// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme, UiProfile } from '@cratis/scene.model';
import { DesignLinkDiagnosticCode, defaultDesignSystem, evaluateDesignComponents, resolveDesign } from '@cratis/scene.engine';
import { defaultBlueprint, defaultBlueprintDesignSystem, defaultBlueprintAnatomy } from '@cratis/scene.blueprint.default';
import { resolvePackageHost } from '@cratis/scene.react';
import { inRepositoryPackages } from './given/inRepositoryPackages';

const profile: UiProfile = {
    name: 'Default',
    targetPlatform: 'web',
    packages: ['Tailwind', 'PrimeReact', 'Cratis.Components', 'Cratis.Blueprint.Default'],
};

const host = resolvePackageHost({ profile, policy: { allowExecutableImports: true, allowNetworkAssets: true }, bundles: inRepositoryPackages });

describe('when rendering the default design system with the packages of the repository', () => {
    it('should approve the package set', () => host.diagnostics.should.deep.equal([]));

    it('should find the design system the default blueprint ships', () => host.designSystem!.name.should.equal(defaultBlueprintDesignSystem.name));

    it('should resolve the default theme in its first mode', () => [host.design!.theme, host.design!.mode].should.deep.equal(['Scene Default', 'light']));

    it('should not complain about a part, variant or state its components do not draw', () => {
        const mismatches = host.designLinking!.diagnostics.filter(diagnostic => diagnostic.code !== DesignLinkDiagnosticCode.ComponentUnbound && diagnostic.code !== DesignLinkDiagnosticCode.ComponentWithoutAnatomy);
        mismatches.map(diagnostic => diagnostic.message).should.deep.equal([]);
    });

    it('should link the shell components to the default blueprint', () => {
        const linked = new Map(host.designLinking!.links.map(link => [link.designComponent, link.package]));
        ['Shell', 'Topbar', 'Sidebar', 'Menu', 'Footer', 'StatusChip'].filter(name => linked.get(name) !== 'Cratis.Blueprint.Default').should.deep.equal([]);
    });

    it('should link the foundation components to a package that declares their anatomy', () => {
        const linked = new Set(host.designLinking!.links.map(link => link.designComponent));
        ['Text', 'Card', 'Button'].filter(name => !linked.has(name)).should.deep.equal([]);
    });

    it('should name every component nobody renders, so nothing is dropped silently', () =>
        host.designDiagnostics.filter(message => message.includes('finds no component')).length.should.equal(host.designLinking!.diagnostics.filter(diagnostic => diagnostic.code === DesignLinkDiagnosticCode.ComponentUnbound).length));

    it('should declare anatomy for every component the shell draws', () => {
        const descriptors = new Map(defaultBlueprint.descriptors!.map(descriptor => [descriptor.component.split(':')[1], descriptor]));
        Object.keys(defaultBlueprintAnatomy).filter(name => descriptors.get(name)?.anatomy === undefined).should.deep.equal([]);
    });
});

describe('when drawing the default design system in a dark scheme', () => {
    const dark = resolveDesign({ designSystem: defaultBlueprintDesignSystem, appearance: { colorScheme: ColorScheme.Dark } });

    it('should draw the dark mode', () => [dark.mode, dark.colorScheme].should.deep.equal(['dark', ColorScheme.Dark]));
    it('should not leave a part unresolved', () => dark.diagnostics.should.deep.equal([]));
    it('should give the menu its selected look', () => dark.components.find(component => component.name === 'Menu')!.variants[0].states!.selected.should.have.keys('background', 'text', 'border', 'radius'));
});

describe('when evaluating the anatomy of the default design system', () => {
    const light = defaultBlueprintDesignSystem.themes[0].modes[0].tokens;
    const evaluated = evaluateDesignComponents(defaultDesignSystem.components, light);

    it('should resolve every part against the shipped theme', () => evaluated.problems.should.deep.equal([]));
    it('should reproduce the look the shell always had', () => {
        const part = (component: string, name: string) => evaluated.components.find(candidate => candidate.name === component)!.variants[0].parts[name];
        [part('Card', 'background'), part('Card', 'border'), part('Text', 'text'), part('Shell', 'background'), part('Shell', 'font')]
            .should.deep.equal([light['color.surface'], light['color.border'], light['color.text'], light['color.background'], light['font.sans']]);
    });
});
