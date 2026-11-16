// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource, type TemplateReference as SceneTemplateReference } from '@cratis/scene.model';
import { TemplateReferenceKind } from '../../ScreenTemplates/TemplateReferenceKind';
import type { TemplateReference } from '../../ScreenTemplates/TemplateReference';
import type { TemplateBrowserEntry } from '../../TemplateBrowser/TemplateBrowserEntry';
import { TemplateOrigin } from '../../TemplateBrowser/TemplateOrigin';

/** The reference the template browser keeps for a template, as the reference Scene's profile stores for it. */
export function sceneReferenceOf(entry: TemplateBrowserEntry): SceneTemplateReference {
    return entry.origin === TemplateOrigin.Own || entry.package === undefined
        ? { source: TemplateReferenceSource.Own, id: entry.reference.id }
        : { source: TemplateReferenceSource.Blueprint, blueprint: entry.package, id: entry.name };
}

/** The reference Scene's profile stores for a template, as the template browser knows it (to mark the one in place). */
export function browserReferenceOf(reference: SceneTemplateReference | undefined): TemplateReference | undefined {
    if (reference === undefined) return undefined;
    return { kind: reference.source === TemplateReferenceSource.Own ? TemplateReferenceKind.Application : TemplateReferenceKind.Blueprint, id: reference.id };
}
