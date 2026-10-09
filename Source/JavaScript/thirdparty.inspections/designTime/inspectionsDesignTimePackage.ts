// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeBundle, ScenePackageBundle } from '@cratis/scene.react';
import { inspectionsPackage } from '../inspectionsPackage';
import { ChecklistDesigner } from './ChecklistDesigner';
import { ChecklistItemsEditor } from './ChecklistItemsEditor';
import { ChecklistPreview } from './ChecklistPreview';
import { generateChecklistItemsAction } from './generateChecklistItemsAction';
import { SeverityBadge } from './SeverityBadge';

/** Every design-time extension point this package fills, under the names its manifest declares. */
export const inspectionsDesignTime: DesignTimeBundle = {
    previews: { checklistPreview: ChecklistPreview },
    designers: { checklistDesigner: ChecklistDesigner },
    propertyEditors: { checklistItems: ChecklistItemsEditor },
    propertyDisplays: { severityBadge: SeverityBadge },
    actions: { [generateChecklistItemsAction.descriptor.id]: generateChecklistItemsAction },
};

/**
 * The bundle a design-time host loads: the runtime bundle plus the design-time contributions. Kept in its own
 * module so importing the runtime bundle never pulls designers in.
 */
export const inspectionsDesignTimePackage: ScenePackageBundle = { ...inspectionsPackage, designTime: inspectionsDesignTime };
