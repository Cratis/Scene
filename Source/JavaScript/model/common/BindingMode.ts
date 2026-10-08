// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How updates flow between a binding source and target.
 */
export enum BindingMode {
    /** Source changes update the target; target changes are not written back. */
    OneWay = 'oneWay',

    /** Source and target changes flow both directions when both properties declare support. */
    TwoWay = 'twoWay',
}
