// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isPackageSelectionValid } from '@cratis/scene.engine';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { PackageInclusion } from '../PackageInclusion';
import { ResolvedUiProfile } from '../ResolvedUiProfile';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { resolveUiProfile } from '../resolveUiProfile';

describe('when resolving the default profile', () => {
    let resolved: ResolvedUiProfile;

    beforeEach(() => {
        resolved = resolveUiProfile(defaultUiProfileSettings(blueprintPreviewBundles), blueprintPreviewBundles);
    });

    it('should order core first, then the default component library, then the chosen ones, then the blueprint', () => {
        resolved.profile.packages.should.deep.equal(['core', 'Tailwind', 'Cratis.Components', 'PrimeReact', 'Cratis.Blueprint.Default']);
    });

    it('should mark core as the always-present fallback', () => {
        resolved.entries[0].inclusion.should.equal(PackageInclusion.Fallback);
    });

    it('should mark the chosen packages explicit', () => {
        resolved.entries.filter(entry => entry.inclusion === PackageInclusion.Explicit).map(entry => entry.name).should.deep.equal(['Tailwind', 'PrimeReact', 'Cratis.Blueprint.Default']);
    });

    it('should mark a package that is only there for a requirement automatic', () => {
        resolved.entries.find(entry => entry.name === 'Cratis.Components')!.inclusion.should.equal(PackageInclusion.Automatic);
    });

    it('should say which packages require an automatic one', () => {
        resolved.entries.find(entry => entry.name === 'Cratis.Components')!.requiredBy.should.deep.equal(['Cratis.Blueprint.Default']);
    });

    it('should take the layout from the shell', () => {
        resolved.layout.should.equal('AppShell');
        resolved.profile.layout!.should.equal('AppShell');
    });

    it('should be valid', () => {
        resolved.isValid.should.be.true;
        isPackageSelectionValid(resolved.selection).should.be.true;
    });

    it('should explain which package supplies a shared component name', () => {
        const button = resolved.collisions.find(collision => collision.name === 'button')!;
        button.package.should.equal('PrimeReact');
        button.shadows.should.deep.equal(['core']);
    });

    it('should offer only the themes compatible with the packages', () => {
        resolved.compatibleThemes.map(theme => theme.name).should.deep.equal(['Scene Default Light', 'Scene Default Dark']);
    });
});
