// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconReference } from '@cratis/scene.model';

/**
 * One state a {@link PrimeMultiStateCheckbox} can cycle through.
 *
 * The `value` is exactly what the document authored - any JSON value, including `null`, numbers, booleans
 * and objects. The `icon` is either a legacy PrimeIcons class name (`'pi pi-check'`) or a qualified
 * {@link IconReference}.
 */
export interface MultiStateOption {
    label: string;
    value: unknown;
    icon?: string | IconReference;
}
