// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../../UiProfile/defaultUiProfileSettings';
import { persistedFromSettings } from '../../../UiProfile/persistedFromSettings';
import { screenEditorRuntimeForProfile } from '../screenEditorRuntimeForProfile';

const legacy = persistedFromSettings(defaultUiProfileSettings(blueprintPreviewBundles), blueprintPreviewBundles);
const fresh = persistedFromSettings({ ...defaultUiProfileSettings(blueprintPreviewBundles), packages: ['Tailwind'] }, blueprintPreviewBundles);
const runtime = (profile?: typeof legacy) => screenEditorRuntimeForProfile(profile, blueprintPreviewBundles);

describe('when reading an application profile for the editor and preview', () => {
    it('should keep PrimeReact for an application with no saved profile', () => runtime().compositionProfile.packages.should.include('PrimeReact'));
    it('should keep PrimeReact for an empty legacy selection', () =>
        runtime({ ...legacy, packages: [], templatePacks: [], resolvedPackages: [] }).compositionProfile.packages.should.include('PrimeReact'));
    it('should honor an explicit PrimeReact selection', () => runtime(legacy).compositionProfile.packages.should.include('PrimeReact'));
    it('should rank explicit PrimeReact beneath the blueprint', () => {
        const packages = runtime(legacy).compositionProfile.packages;
        packages.indexOf('PrimeReact').should.be.lessThan(packages.indexOf('Cratis.Blueprint.Default'));
    });
    it('should not add PrimeReact to a fresh profile', () => runtime(fresh).compositionProfile.packages.should.not.include('PrimeReact'));
    it('should resolve fresh-profile components through React Aria backed Cratis Components', () =>
        runtime(fresh).compositionProfile.packages.should.include('Cratis.Components'));
});
