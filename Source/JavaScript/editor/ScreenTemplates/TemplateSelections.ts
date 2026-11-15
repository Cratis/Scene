// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateSelection } from './TemplateSelection';

/** What resolving a hierarchy produces. */
export interface TemplateSelections {
    /** The application's default, the root every module inherits from. */
    application: TemplateSelection;

    /** The template in effect for every node, by node id. */
    nodes: Map<string, TemplateSelection>;
}
