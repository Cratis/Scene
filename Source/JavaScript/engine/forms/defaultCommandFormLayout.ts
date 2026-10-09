// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormWidthUnit } from '@cratis/scene.model';

/**
 * Backward-compatible command form geometry: one flexible column and no authored placements.
 */
export const defaultCommandFormLayout: CommandFormLayout = {
    columns: [{ index: 1, width: { unit: FormWidthUnit.Fraction, value: 1 } }],
    placements: [],
};
