// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { persistedFromSettings } from '../persistedFromSettings';
import { packagesOrLegacyFallback } from '../packagesOrLegacyFallback';
import { settingsFromPersisted } from '../settingsFromPersisted';

const empty = { ...persistedFromSettings(defaultUiProfileSettings(blueprintPreviewBundles), blueprintPreviewBundles), packages: [], templatePacks: [], resolvedPackages: [] };

describe('when reading an empty legacy package selection', () => {
    const result = packagesOrLegacyFallback(empty, blueprintPreviewBundles);
    it('should keep PrimeReact available for old screens', () => result.resolvedPackages.should.include('PrimeReact'));
    it('should put the same selection in the designer', () => settingsFromPersisted(empty, undefined, blueprintPreviewBundles).packages.should.deep.equal(result.packages));
    it('should not change the stored value', () => empty.resolvedPackages.should.be.empty);
});

describe('when reading an explicit selection', () => {
    const selections = [
        { ...empty, packages: ['Tailwind'] },
        { ...empty, templatePacks: ['Own.Templates'] },
        { ...empty, resolvedPackages: ['core', 'Cratis.Components'] },
        { ...empty, packages: ['PrimeReact'] },
    ];
    for (const selection of selections) {
        it(`should preserve ${JSON.stringify(selection.packages.length ? selection.packages : selection.templatePacks.length ? selection.templatePacks : selection.resolvedPackages)}`, () =>
            packagesOrLegacyFallback(selection, blueprintPreviewBundles).should.equal(selection));
    }
});
