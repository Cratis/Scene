// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';

/**
 * A categorized set of templates a business gallery can show for a scope.
 */
export interface BusinessGalleryCategory {
    category: string;
    templates: ScreenTemplate[];
}
