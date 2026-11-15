// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import { createScreenEditorRuntime } from '../../ScreenEditor/Runtime/screenEditorRuntime';
import { describeTemplateBrowser } from '../describeTemplateBrowser';
import { runtimeForEntry } from '../runtimeForEntry';
import { aBrowserInput } from '../for_describeTemplateBrowser/given/aBrowserInput';

const settings = defaultUiProfileSettings(blueprintPreviewBundles);
const created = createScreenEditorRuntime(blueprintPreviewBundles, resolveUiProfile(settings, blueprintPreviewBundles).profile);
const runtime = { bundles: created.bundles, profile: created.profile, registry: created.registry, iconAdapters: created.iconAdapters };
const entries = describeTemplateBrowser(aBrowserInput()).entries;
const own = entries.find(entry => entry.package === undefined)!;
const notAdded = entries.find(entry => entry.package === 'Cratis.Blueprint.Approvals')!;

describe('when choosing what to preview a template with', () => {
    it('should use the application\'s own runtime for an own template', () => runtimeForEntry(own, runtime, settings, blueprintPreviewBundles).should.equal(runtime));
    it('should use the application\'s own runtime when nothing is selected', () => runtimeForEntry(undefined, runtime, settings, blueprintPreviewBundles).should.equal(runtime));
    it('should draw a template of a blueprint that is not added under a profile that has the blueprint', () => {
        notAdded.installed.should.be.false;
        const used = runtimeForEntry(notAdded, runtime, settings, blueprintPreviewBundles);
        used.should.not.equal(runtime);
        JSON.stringify(used.profile).should.contain('Cratis.Blueprint.Approvals');
    });
    it('should not change the application\'s settings to do it', () => settings.templatePacks.should.not.include('Cratis.Blueprint.Approvals'));
});
