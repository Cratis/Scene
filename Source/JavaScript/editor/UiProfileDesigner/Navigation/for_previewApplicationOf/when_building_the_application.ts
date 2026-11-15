// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind } from '@cratis/scene.model';
import { listDestinations } from '@cratis/scene.blueprint.default';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../../../UiProfile/resolveUiProfile';
import { previewApplicationOf } from '../previewApplicationOf';

describe('when building the application the canvas runs', () => {
    const settings = defaultUiProfileSettings(blueprintPreviewBundles);
    const application = previewApplicationOf(resolveUiProfile(settings, blueprintPreviewBundles), blueprintPreviewBundles);
    const destinations = listDestinations(application.document).flatMap(group => group.destinations);

    it('should have one screen for every screen template of the shell', () => application.document.screens.length.should.equal(application.document.screenTemplates.length));
    it('should let the picker offer every screen', () => destinations.filter(destination => destination.destination.kind === DestinationKind.Slot).length.should.equal(application.document.screens.length));
    it('should offer the dialogs too', () => destinations.some(destination => destination.destination.kind === DestinationKind.Dialog).should.be.true);
    it('should carry the profile so the host resolves component names against it', () => application.composition.profile!.should.equal(application.document.uiProfiles![0]));
    it('should keep the sign-in and status screens out of the application shell', () => application.document.screens.filter(screen => screen.layout === 'FullPage').length.should.be.greaterThan(0));
});
