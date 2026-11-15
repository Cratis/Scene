// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutItem } from '../Layouts/LayoutItem';
import type { LayoutLabels } from '../Layouts/toLayoutContainerDescriptors';

// English names for the layout containers, for a host that has no localized ones.
export const defaultLayoutLabels: LayoutLabels = {
    [LayoutItem.Stack]: 'Stack',
    [LayoutItem.Row]: 'Row',
    [LayoutItem.Grid]: 'Grid',
    [LayoutItem.Container]: 'Container',
    [LayoutItem.Wrap]: 'Wrap',
    [LayoutItem.Canvas]: 'Canvas',
};
