// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

// Words that say which string they are, so a specification can tell where each one ended up.
const named = (prefix: string): unknown => new Proxy({}, { get: (_target, key) => `${prefix}.${String(key)}` });

export const strings = {
    nodes: named('nodes'),
    summary: named('summary'),
    problems: named('problems'),
} as unknown as UiProfileDesignerStrings;

export const defaults = (): UiProfileSettings => defaultUiProfileSettings(blueprintPreviewBundles);
export const resolve = (settings: UiProfileSettings) => resolveUiProfile(settings, blueprintPreviewBundles);
