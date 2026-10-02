// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconUsage } from '../IconUsage';
import { alphaName, betaName } from '../for_iconFixtures/iconFixtures';

export const usages: IconUsage[] = [
    { value: { library: alphaName, key: 'home', variant: 'solid' }, location: 'shell/menu' },
    { value: { library: alphaName, key: 'trash', variant: 'outline' }, location: 'orders/delete' },
    { value: { library: betaName, key: 'bin' }, location: 'orders/archive' },
    { value: { library: betaName, key: 'gone' }, location: 'orders/old' },
    { value: 'home', location: 'legacy/menu' },
];
