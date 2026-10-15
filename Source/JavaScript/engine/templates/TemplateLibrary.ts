// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateSource } from './TemplateSource';

/**
 * Every template a host can choose from: the ones the user created in the workspace and the ones blueprint
 * packages ship.
 */
export interface TemplateLibrary {
    /** The workspace's own templates. Its manifest is never treated as a blueprint. */
    own?: TemplateSource;

    /** The blueprint packages and the templates they ship, in browse order. */
    blueprints: TemplateSource[];
}
