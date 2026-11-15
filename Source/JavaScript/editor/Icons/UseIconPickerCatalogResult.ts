// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconPickerCatalog } from '@cratis/components/IconPicker';
import { IconDiagnostic } from '@cratis/scene.engine';

// What {@link useIconPickerCatalog} hands back.
export interface UseIconPickerCatalogResult {
    catalog: IconPickerCatalog;

    diagnostics: IconDiagnostic[];

    loadedVersion: number;
}
