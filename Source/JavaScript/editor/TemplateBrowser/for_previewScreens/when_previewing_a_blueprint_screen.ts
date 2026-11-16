// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplatePreviewState } from '@cratis/scene.blueprint.default';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import { describeTemplateBrowser } from '../describeTemplateBrowser';
import { previewOfScreen, previewScreensOf } from '../previewScreens';
import { aBrowserInput } from '../for_describeTemplateBrowser/given/aBrowserInput';

const settings = defaultUiProfileSettings(blueprintPreviewBundles);
const profile = resolveUiProfile({ ...settings, templatePacks: ['Cratis.Blueprint.Approvals'] }, blueprintPreviewBundles).profile;
const entries = describeTemplateBrowser(aBrowserInput()).entries;
const allRequests = entries.find(entry => entry.package === 'Cratis.Blueprint.Approvals' && entry.displayName === 'All requests')!;
const own = entries.find(entry => entry.package === undefined)!;

describe('when previewing a blueprint screen', () => {
    const screens = previewScreensOf(allRequests, blueprintPreviewBundles);
    const element = previewOfScreen(screens[0], TemplatePreviewState.Populated, blueprintPreviewBundles, profile);

    it('should find the screen the package composes from the template', () => screens.map(screen => screen.name).should.deep.equal(['approvals.all']));
    it('should be the screen\'s shell', () => element.id.should.equal('screen-approvals.all'));
    it('should show the content of the template in the shell, which the screen itself leaves to it', () => {
        screens[0].slotContent.should.deep.equal({});
        Object.values((element as unknown as { slots?: Record<string, unknown[]> }).slots ?? {}).flat().length.should.be.greaterThan(0);
    });
    it('should not change the screen', () => screens[0].slotContent.should.deep.equal({}));
    it('should have no screens for an own template, which is seen by opening it', () => previewScreensOf(own, blueprintPreviewBundles).should.deep.equal([]));
});
