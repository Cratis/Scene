// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A reference to a value already resolved by whatever produced this model (Stage translating Screenplay,
 * or Studio's editor) — Scene never re-runs name resolution, it only carries the resolved path forward.
 */
export interface BindingExpression {
    path: string;
}

export const BindingExpressionPropertyNames: (keyof BindingExpression)[] = ['path'];
