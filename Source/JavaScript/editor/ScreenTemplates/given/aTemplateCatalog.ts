// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import { ApplicationTemplate } from '../ApplicationTemplate';
import { TemplateCatalog } from '../TemplateCatalog';
import { buildTemplateCatalog } from '../buildTemplateCatalog';

/** The catalog of the default UI Profile, plus the given application-owned templates. */
export function aTemplateCatalog(applicationTemplates: ApplicationTemplate[] = []): TemplateCatalog {
    const resolved = resolveUiProfile(defaultUiProfileSettings(blueprintPreviewBundles), blueprintPreviewBundles);
    return buildTemplateCatalog(resolved, blueprintPreviewBundles, applicationTemplates);
}
