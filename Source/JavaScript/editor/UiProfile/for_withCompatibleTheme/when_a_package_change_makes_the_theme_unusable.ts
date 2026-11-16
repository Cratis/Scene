// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme } from '@cratis/scene.blueprint.default';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { withCompatibleTheme } from '../withCompatibleTheme';

describe('when a package change makes the theme unusable', () => {
    const base = defaultUiProfileSettings(blueprintPreviewBundles);

    it('should keep a theme the profile can still use', () => {
        withCompatibleTheme(base, blueprintPreviewBundles).should.equal(base);
    });

    it('should replace an unusable theme with a compatible one of the same brightness', () => {
        withCompatibleTheme({ ...base, theme: 'aura-light-blue', colorScheme: ColorScheme.Dark }, blueprintPreviewBundles).theme.should.equal('Scene Default Dark');
    });
});
