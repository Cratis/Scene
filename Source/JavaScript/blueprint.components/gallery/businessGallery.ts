// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { BusinessGalleryCategory } from './BusinessGalleryCategory';
import { componentsPageTemplates } from '../templates';

/**
 * Returns templates grouped by visible gallery category and filtered by scope metadata.
 */
export function businessGallery(scope: TemplateScope, templates: ScreenTemplate[] = componentsPageTemplates): BusinessGalleryCategory[] {
    const categories = new Map<string, ScreenTemplate[]>();
    for (const template of templates.filter(template => template.metadata?.scopes?.includes(scope))) {
        const category = template.metadata?.category ?? 'Business / Other';
        categories.set(category, [...(categories.get(category) ?? []), template]);
    }

    return [...categories.entries()].map(([category, categoryTemplates]) => ({ category, templates: categoryTemplates }));
}
