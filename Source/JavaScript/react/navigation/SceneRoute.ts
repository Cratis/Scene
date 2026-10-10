// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One route a navigation host can be deep linked to: a template such as `sales/orders/{orderId}` and the
 * screen, and optionally the outlet, it opens.
 */
export interface SceneRoute {
    route: string;
    screen: string;
    outlet?: string;
}
