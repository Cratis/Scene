// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateLevel } from './TemplateLevel';

/** Where an inherited template was chosen. */
export interface TemplateInheritance {
    /** The level that chose it. */
    level: TemplateLevel;

    /** The node that chose it, or absent when it is the application's default. */
    nodeId?: string;
}
