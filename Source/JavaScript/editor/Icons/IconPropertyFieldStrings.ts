// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconPickerLabels } from '@cratis/components/IconPicker';
import { IconDiagnosticKind } from '@cratis/scene.engine';

// Every label an icon property field shows beyond the picker's own.
//
// Messages that name the icon use `{library}`, `{key}` and `{variant}` placeholders, replaced by
// `formatMessage`. The host owns the resource file, so a missing label is a compile error there.
export interface IconPropertyFieldStrings {
    ariaLabel: string;

    picker: IconPickerLabels;

    diagnostics: Record<IconDiagnosticKind, string>;

    notAllowed: string;
}
