// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Panel } from '../Panel';
import { Size } from '../../common';

/**
 * Places its children at absolute coordinates within a coordinate space of its own. A child states where
 * it sits through the `Canvas.Left`, `Canvas.Top`, `Canvas.Right` and `Canvas.Bottom` keys of its
 * `properties`, which is how an attached property is carried in a model that has no attached properties
 * of its own.
 *
 * Named for `@cratis/components`' `Canvas`, which is the surface a Cratis application actually draws one
 * on. This is a panel in the element tree, and is not the same concept as a `FreeformArrangement` - that
 * arranges a *layout slot's* content with one placement variant per size class.
 */
export interface Canvas extends Panel {
    extent: Size;
}

export const CanvasPropertyNames: (keyof Canvas)[] = ['extent'];
