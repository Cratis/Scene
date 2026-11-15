// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { ProfileBlockerKind } from '../ProfileBlockerKind';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { findProfileBlockers } from '../findProfileBlockers';
import { aStandaloneLibrary, bundlesWith } from '../given/aStandaloneLibrary';

describe('when the profile itself is broken', () => {
    const broken = aStandaloneLibrary('Broken');
    broken.manifest.kind = PackageKind.Blueprint;
    broken.manifest.layouts = [];
    broken.manifest.dependencies = [{ name: 'Nowhere' }, { name: 'Tailwind', versionRange: '^99.0.0' }];
    const bundles = bundlesWith(broken);
    const base = defaultUiProfileSettings(bundles);
    const kindsFor = (settings: typeof base) => findProfileBlockers(settings, bundles, []).map(blocker => blocker.kind);

    it('should block on a dependency nothing supplies', () => {
        kindsFor({ ...base, templatePacks: ['Broken'] }).should.include(ProfileBlockerKind.MissingDependency);
    });

    it('should block on a dependency at an unacceptable version and say what was found', () => {
        const blocker = findProfileBlockers({ ...base, templatePacks: ['Broken'] }, bundles, []).find(candidate => candidate.kind === ProfileBlockerKind.VersionConflict)!;
        blocker.subject.should.equal('Tailwind');
        blocker.found!.should.equal('4.3.3');
    });

    it('should block when there is no shell', () => {
        kindsFor({ ...base, shell: '' }).should.include(ProfileBlockerKind.NoShell);
    });

    it('should block on a shell that supplies no layout', () => {
        kindsFor({ ...base, shell: 'Cratis.Blueprint.Components' }).should.include(ProfileBlockerKind.ShellSuppliesNoLayout);
    });

    it('should block on a theme the packages cannot use', () => {
        kindsFor({ ...base, theme: 'aura-light-blue' }).should.include(ProfileBlockerKind.ThemeIncompatible);
    });

    it('should block on a default screen template nothing provides', () => {
        kindsFor({ ...base, defaultScreenTemplate: 'Nonexistent' }).should.include(ProfileBlockerKind.DefaultScreenTemplateUnavailable);
    });

    it('should accept a default screen template the shell provides', () => {
        kindsFor({ ...base, defaultScreenTemplate: 'CrudList' }).should.not.include(ProfileBlockerKind.DefaultScreenTemplateUnavailable);
    });
});
