// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { primeReactPackage } from '@cratis/scene.primereact';
import { corePackage } from '@cratis/scene.react';
import { tailwindPackage } from '@cratis/scene.tailwind';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { createDesignTimeHost } from '../createDesignTimeHost';
import { defaultBlueprint } from '@cratis/scene.blueprint.default';

// Cratis/StudioIssues#863: an application with a shell of its own (the document declares the layout `AppShell`) stores that layout's name in its UI profile. No package
// provides it, so the design-time host used to refuse the whole profile as blocked and approve no package at all: every package designer, editor and action said
// the package was "not approved by this host" for the applications that most need them.
const bundles = [corePackage, tailwindPackage, primeReactPackage, cratisComponentsPackage];
const profile = (layout: string | undefined) => ({ name: 'Desktop', targetPlatform: 'web', packages: ['core', 'PrimeReact', 'Tailwind', 'Cratis.Components'], ...(layout ? { layout } : {}) }) as never;

describe('when the profile names the applications own layout', () => {
    const host = createDesignTimeHost(bundles, profile('AppShell'));

    it('should approve the packages the profile lists', () => host.host.bundles.map(bundle => bundle.manifest.name).should.include('Cratis.Components'));
    it('should not report the own layout as a problem of the packages', () => host.diagnostics.should.deep.equal([]));
    it('should offer the command form designer of the package', () => {
        const descriptor = bundles.flatMap(bundle => bundle.descriptors ?? []).find(candidate => candidate.component === 'Cratis.Components:commandForm')!;
        (host.designer(descriptor).contribution !== undefined).should.be.true;
    });
});

describe('when the profile names no layout', () => {
    it('should approve the packages the profile lists', () => createDesignTimeHost(bundles, profile(undefined)).host.bundles.map(bundle => bundle.manifest.name).should.include('Cratis.Components'));
});

// The editor is lent the default blueprint whether or not the profile lists it, and that blueprint declares a layout named AppShell: an application whose own shell
// has the same name must still have the packages it lists approved.
describe('when the profile names an own layout that a blueprint lent to the editor also declares', () => {
    const lent = [...bundles, defaultBlueprint];
    const layoutName = lent.flatMap(bundle => bundle.layouts ?? [])[0]?.name ?? 'AppShell';
    const host = createDesignTimeHost(lent, profile(layoutName));

    it('should approve the packages the profile lists', () => host.host.bundles.map(bundle => bundle.manifest.name).should.include('Cratis.Components'));
    it('should report nothing', () => host.diagnostics.should.deep.equal([]));
});
