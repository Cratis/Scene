// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction } from './InteractionAction';

/**
 * Re-runs a query-backed element.
 */
export interface RefreshQueryAction extends InteractionAction {
    query: string;
}

export const RefreshQueryActionPropertyNames: (keyof RefreshQueryAction)[] = ['query', 'kind'];
