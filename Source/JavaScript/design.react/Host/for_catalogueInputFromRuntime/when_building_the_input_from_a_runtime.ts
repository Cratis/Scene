// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { screenEditorRuntimeForProfile } from '@cratis/scene.editor';
import { catalogueInputFromRuntime } from '../catalogueInputFromRuntime';

describe('when building the input from a runtime', () => {
    const runtime = screenEditorRuntimeForProfile(undefined);
    const input = catalogueInputFromRuntime(runtime);
    const packagesOfTemplates = (templates: typeof input.templates) => new Set(runtime.bundles
        .filter(bundle => (bundle.screenTemplates ?? []).some(template => templates?.includes(template)))
        .map(bundle => bundle.manifest.name));

    it('should hold more packages than the profile lists', () => runtime.bundles.map(bundle => bundle.manifest.name).some(name => !runtime.profile.packages.includes(name)).should.be.true);
    it('should offer the templates of the packages the profile lists', () => packagesOfTemplates(input.templates).has('Cratis.Blueprint.Default').should.be.true);
    it('should offer no template of a package the profile does not list', () => [...packagesOfTemplates(input.templates)].filter(name => !runtime.profile.packages.includes(name) && name !== 'core').should.deep.equal([]));

    describe('and the host says the profile has changed', () => {
        const changed = catalogueInputFromRuntime(runtime, { profile: { ...runtime.profile, packages: [...runtime.profile.packages, 'Cratis.Blueprint.Components'] } });

        it('should offer the templates of the package it now lists', () => packagesOfTemplates(changed.templates).has('Cratis.Blueprint.Components').should.be.true);
    });
});
