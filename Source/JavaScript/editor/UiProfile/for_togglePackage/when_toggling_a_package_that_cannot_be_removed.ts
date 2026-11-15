// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { PackageEditKind } from '../PackageEditKind';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { togglePackage } from '../togglePackage';

describe('when toggling a package that cannot be removed', () => {
    const settings = defaultUiProfileSettings(blueprintPreviewBundles);

    it('should block removing a package that is only there for a requirement and name what requires it', () => {
        const outcome = togglePackage(settings, 'Cratis.Components', blueprintPreviewBundles);
        outcome.kind.should.equal(PackageEditKind.Blocked);
        outcome.requiredBy.should.deep.equal(['Cratis.Blueprint.Default']);
        outcome.settings.should.equal(settings);
    });

    it('should block removing core', () => {
        togglePackage(settings, 'core', blueprintPreviewBundles).kind.should.equal(PackageEditKind.Blocked);
    });

    it('should leave blueprints to the shell and template pack choices', () => {
        togglePackage(settings, 'Cratis.Blueprint.Components', blueprintPreviewBundles).kind.should.equal(PackageEditKind.Unchanged);
    });
});
