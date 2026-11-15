// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateLevel } from '../TemplateLevel';
import { TemplateNode } from '../TemplateNode';

/** One module with a feature, a sub-feature and a slice, none of which has chosen a template. */
export function aHierarchy(choices: Partial<Record<'module' | 'feature' | 'subFeature' | 'slice', string>> = {}): TemplateNode[] {
    return [
        { id: 'module', level: TemplateLevel.Module, explicit: choices.module },
        { id: 'feature', level: TemplateLevel.Feature, parentId: 'module', explicit: choices.feature },
        { id: 'subFeature', level: TemplateLevel.SubFeature, parentId: 'feature', explicit: choices.subFeature },
        { id: 'slice', level: TemplateLevel.Slice, parentId: 'subFeature', explicit: choices.slice },
    ];
}
