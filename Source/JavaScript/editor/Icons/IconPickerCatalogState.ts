// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconPickerCatalogStatus } from '@cratis/components/IconPicker';

// How far loading an effective catalog into a picker catalog has got.
export interface IconPickerCatalogState {
    status: IconPickerCatalogStatus;

    error?: string;
}
