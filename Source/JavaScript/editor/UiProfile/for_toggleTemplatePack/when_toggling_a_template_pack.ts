// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { PackageEditKind } from '../PackageEditKind';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { resolveUiProfile } from '../resolveUiProfile';
import { toggleTemplatePack } from '../toggleTemplatePack';

describe('when toggling a template pack', () => {
    const settings = defaultUiProfileSettings(blueprintPreviewBundles);
    const added = toggleTemplatePack(settings, 'Cratis.Blueprint.Components', blueprintPreviewBundles);

    it('should add the pack without changing the shell', () => {
        added.kind.should.equal(PackageEditKind.Added);
        added.settings.templatePacks.should.deep.equal(['Cratis.Blueprint.Components']);
        added.settings.shell.should.equal('Cratis.Blueprint.Default');
    });

    it('should make the pack part of the resolved profile after the shell it builds on', () => {
        const { packages } = resolveUiProfile(added.settings, blueprintPreviewBundles).profile;
        packages[packages.length - 1].should.equal('Cratis.Blueprint.Components');
    });

    it('should remove the pack when toggled again', () => {
        const removed = toggleTemplatePack(added.settings, 'Cratis.Blueprint.Components', blueprintPreviewBundles);
        removed.kind.should.equal(PackageEditKind.Removed);
        removed.settings.templatePacks.should.be.empty;
    });

    it('should refuse to make the shell a template pack', () => {
        const outcome = toggleTemplatePack(settings, 'Cratis.Blueprint.Default', blueprintPreviewBundles);
        outcome.kind.should.equal(PackageEditKind.Blocked);
        outcome.requiredBy.should.deep.equal(['Cratis.Blueprint.Default']);
    });

    it('should ignore a package that is not a blueprint', () => {
        toggleTemplatePack(settings, 'PrimeReact', blueprintPreviewBundles).kind.should.equal(PackageEditKind.Unchanged);
    });
});
