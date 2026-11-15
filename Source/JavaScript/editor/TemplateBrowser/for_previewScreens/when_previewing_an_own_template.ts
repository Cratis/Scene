// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplatePreviewState } from '@cratis/scene.blueprint.default';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { createExternalComponent } from '../../ScreenEditor/Document/createExternalComponent';
import { everyElementId } from '../../ScreenEditor/Selection/sceneTree';
import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import { describeTemplateBrowser } from '../describeTemplateBrowser';
import { previewOfOwnTemplate } from '../previewScreens';
import { aBrowserInput } from '../for_describeTemplateBrowser/given/aBrowserInput';

const profile = resolveUiProfile(defaultUiProfileSettings(blueprintPreviewBundles), blueprintPreviewBundles).profile;
const entries = describeTemplateBrowser(aBrowserInput()).entries;
const own = entries.find(entry => entry.package === undefined)!;
const blueprint = entries.find(entry => entry.package !== undefined)!;

const documentOf = (id: string) => JSON.stringify({
    layouts: [],
    screenTemplates: [{
        name: id,
        slots: [{ name: 'header' }, { name: 'products' }],
        content: { header: [createExternalComponent('grid-title', 'Title', 'title', { text: 'Products' })], products: [createExternalComponent('grid-cards', 'Cards', 'card', { title: 'Mug' })] },
        arrangement: { root: { kind: 'Column', gap: 8, children: [{ slotName: 'header' }, { slotName: 'products', grow: 1 }] } },
    }],
    dialogTemplates: [], screens: [], exposures: [], instanceContributions: [],
});

describe('when previewing an own template', () => {
    const documents = new Map([[own.reference.id.toLowerCase(), documentOf(own.reference.id)]]);
    const element = previewOfOwnTemplate(own, documents, TemplatePreviewState.Populated, blueprintPreviewBundles, profile);

    it('should draw what the template puts in its slots', () => everyElementId([element!]).should.include.members(['grid-title', 'grid-cards']));
    it('should draw nothing for a template whose document has not arrived', () => (previewOfOwnTemplate(own, new Map(), TemplatePreviewState.Populated, blueprintPreviewBundles, profile) === undefined).should.be.true);
    it('should draw nothing when the host gives no documents', () => (previewOfOwnTemplate(own, undefined, TemplatePreviewState.Populated, blueprintPreviewBundles, profile) === undefined).should.be.true);
    it('should leave a blueprint template to the screens its package composes from it', () =>
        (previewOfOwnTemplate(blueprint, new Map([[blueprint.reference.id.toLowerCase(), documentOf(blueprint.reference.id)]]), TemplatePreviewState.Populated, blueprintPreviewBundles, profile) === undefined).should.be.true);
});
