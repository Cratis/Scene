// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyDescriptor } from '@cratis/scene.model';
import { DesignTimeContext } from './DesignTimeContext';

/**
 * Props for a package-provided read-only property display renderer.
 */
export interface DesignTimePropertyDisplayProps {
    context: DesignTimeContext;
    property: PropertyDescriptor;
    value: unknown;
}
