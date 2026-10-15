// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingSourceKind, ExternalComponent, SceneElement, TemplateMetadata } from '@cratis/scene.model';
import { externalComponent } from '../../gallery/elements';
import { defaultBlueprintTemplateProvenance } from '../../templateProvenance';

/**
 * The provenance every foundation template carries. The foundation components draw themselves with no component library, so unlike the earlier
 * gallery templates these require no PrimeReact or Cratis.Components: a host with only this blueprint renders them.
 */
export const foundationTemplateProvenance: Pick<TemplateMetadata, 'compatibility' | 'attribution' | 'license' | 'licenseUrl'> = {
    compatibility: { scene: defaultBlueprintTemplateProvenance.compatibility!.scene },
    attribution: { author: 'Cratis', url: 'https://github.com/Cratis/Scene/tree/main/Source/JavaScript/blueprint.default' },
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
};

/** The package-relative thumbnail path of a foundation template. */
export const thumbnailOf = (templateName: string): string => `thumbnails/${templateName}.svg`;

/**
 * A property taken from a query result - never a value. A template declares *where* its data comes from and the sample-data pack, or the real
 * query, supplies the rows (spec SD1); `path` reaches into the result (`0.value` is the first row's `value`, an empty path is the whole result).
 */
export const fromQuery = (query: string, path = ''): BindingExpression => ({ kind: BindingSourceKind.QueryResult, query, path });

/** A component of this blueprint, by its bare name, with its properties and slot content. */
export const component = (id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, SceneElement[]> = {}): ExternalComponent =>
    externalComponent(id, componentName, properties, slots);
