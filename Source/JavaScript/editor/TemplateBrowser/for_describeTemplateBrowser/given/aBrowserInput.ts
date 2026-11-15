// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind, TemplateScope } from '@cratis/scene.model';
import type { TemplateTarget } from '@cratis/scene.engine';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../../../UiProfile/resolveUiProfile';
import type { UiProfileSettings } from '../../../UiProfile/UiProfileSettings';
import type { ApplicationTemplate } from '../../../ScreenTemplates/ApplicationTemplate';
import { TemplateBrowserMode } from '../../TemplateBrowserMode';
import { allTemplatesRailId } from '../../TemplateBrowserRailItem';
import { templateBrowserSources } from '../../templateBrowserSources';
import type { TemplateBrowserInput } from '../../TemplateBrowserInput';

export const salesHub: ApplicationTemplate = { id: '00000000-0000-4000-8000-000000000001', name: 'Sales hub', category: 'Workspace', scopes: [TemplateScope.Module] };
export const confirmDialog: ApplicationTemplate = { id: '00000000-0000-4000-8000-000000000002', name: 'Confirm', category: 'Dialog', scopes: [TemplateScope.Slice], sliceKinds: [SliceKind.StateChange] };

export const moduleTarget: TemplateTarget = { scope: TemplateScope.Module };
export const stateViewSliceTarget: TemplateTarget = { scope: TemplateScope.Slice, sliceKind: SliceKind.StateView };

/** A browser input over everything the build ships, for the default profile (no blueprint added) unless the settings say otherwise. */
export function aBrowserInput(overrides: Partial<TemplateBrowserInput> = {}, settings?: UiProfileSettings, templates: ApplicationTemplate[] = [salesHub, confirmDialog]): TemplateBrowserInput {
    const profile = settings ?? defaultUiProfileSettings(blueprintPreviewBundles);
    const resolved = resolveUiProfile(profile, blueprintPreviewBundles);
    return { ...templateBrowserSources(overrides.mode ?? TemplateBrowserMode.Manage, profile, resolved, blueprintPreviewBundles, templates), railId: allTemplatesRailId, category: '', filter: '', ...overrides };
}
