// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingMode } from './BindingMode';
import { BindingNullBehavior } from './BindingNullBehavior';
import { BindingSourceKind } from './BindingSourceKind';
import { PropertyValueType } from '../descriptors';

/**
 * A typed reference to a value resolved by the shared Scene runtime.
 *
 * Legacy authored content that only carries `path` is treated as a data-context binding. New content may
 * name the source explicitly: the inherited data context, a query result, another component's output
 * property, or a literal value. Invalid bindings are preserved and reported by validation; they are not
 * rewritten by the resolver.
 */
export interface BindingExpression {
    /** Source kind; absent means `dataContext` for backward compatibility. */
    kind?: BindingSourceKind;

    /** The path inside the selected source. */
    path: string;

    /** The named query binding when `kind` is `queryResult`. */
    query?: string;

    /** Stable component identity when `kind` is `componentProperty`. */
    componentId?: string;

    /** Property path on the source component when it differs from `path`. */
    componentPropertyPath?: string;

    /** Update mode requested by the author. */
    mode?: BindingMode;

    /** How null or undefined source values affect the target. */
    nullBehavior?: BindingNullBehavior;

    /** Optional expected target/source value type for validation. */
    expectedValueType?: PropertyValueType;

    /** Literal value when `kind` is `literal`. */
    value?: unknown;
}

export const BindingExpressionPropertyNames: (keyof BindingExpression)[] = [
    'kind',
    'path',
    'query',
    'componentId',
    'componentPropertyPath',
    'mode',
    'nullBehavior',
    'expectedValueType',
    'value',
];
