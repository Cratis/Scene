// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { ProfileUsage } from '../ProfileUsage';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { findProfileBlockers } from '../findProfileBlockers';

describe('when the profile is sound', () => {
    const usage: ProfileUsage = {
        screen: 'Orders',
        layouts: ['AppShell'],
        screenTemplates: ['CrudList'],
        dialogTemplates: ['FormDialog'],
        components: ['button', 'dataTable'],
        slots: [{ owner: 'CrudList', slot: 'toolbar' }],
    };

    it('should have no blockers without existing screens', () => {
        findProfileBlockers(defaultUiProfileSettings(blueprintPreviewBundles), blueprintPreviewBundles, []).should.be.empty;
    });

    it('should have no blockers when everything an existing screen uses is still supplied', () => {
        findProfileBlockers(defaultUiProfileSettings(blueprintPreviewBundles), blueprintPreviewBundles, [usage]).should.be.empty;
    });
});
