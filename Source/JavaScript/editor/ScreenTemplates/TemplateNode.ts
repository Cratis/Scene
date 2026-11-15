// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SliceKind } from '@cratis/scene.model';
import { TemplateLevel } from './TemplateLevel';

/** One module, feature, sub-feature or slice, and the template it explicitly chose - if any. */
export interface TemplateNode {
    /** A stable identifier, unique among the nodes. */
    id: string;

    /** The level the node sits at. */
    level: TemplateLevel;

    /** For a slice, what kind of slice it is. */
    sliceKind?: SliceKind;

    /** The node above it. Absent for a module, which sits directly under the application. */
    parentId?: string;

    /** The stored template value. Empty or absent means the node inherits. */
    explicit?: string;
}
