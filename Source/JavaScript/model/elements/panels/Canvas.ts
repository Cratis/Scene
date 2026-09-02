// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Panel } from '../Panel';

/**
 * Places its children at absolute coordinates. A child states where it sits through the
 * `Canvas.Left`, `Canvas.Top`, `Canvas.Right` and `Canvas.Bottom` keys of its `properties`,
 * which is how an attached property is carried in a model that has no attached properties of its own.
 */
export type Canvas = Panel;
