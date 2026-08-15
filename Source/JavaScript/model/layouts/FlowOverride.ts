// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { WidthSizeClass, HeightSizeClass } from '../sizeClasses';
import { FlowNode } from './FlowNode';

/**
 * Replaces a {@link FlowArrangement}'s root tree for a targeted width and/or height size class.
 */
export interface FlowOverride {
    /** The width size class this override targets, or `undefined` to target any width. */
    width?: WidthSizeClass;

    /** The height size class this override targets, or `undefined` to target any height. */
    height?: HeightSizeClass;

    /** The replacement tree. */
    root: FlowNode;
}

export const FlowOverridePropertyNames: (keyof FlowOverride)[] = ['width', 'height', 'root'];
