// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression } from '@cratis/scene.model';

/**
 * Resolves a {@link BindingExpression} to its current value. How a binding is actually resolved -
 * against a Stage-produced data context, a Studio design-time fixture, or anything else - is owned by
 * whoever drives the engine, not by the engine itself.
 */
export type BindingResolver = (binding: BindingExpression) => unknown;
