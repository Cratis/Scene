// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { WidthSizeClass } from './WidthSizeClass';
import { HeightSizeClass } from './HeightSizeClass';

/**
 * A width x height size class, UIKit-style. Phone portrait/landscape, tablet and desktop all fall out
 * of this matrix — there is deliberately no separate orientation concept.
 */
export interface SizeClass {
    width: WidthSizeClass;
    height: HeightSizeClass;
}

export const SizeClassPropertyNames: (keyof SizeClass)[] = ['width', 'height'];
