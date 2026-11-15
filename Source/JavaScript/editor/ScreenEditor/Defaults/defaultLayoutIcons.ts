// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FaBars, FaGripLinesVertical, FaRegSquare, FaThLarge, FaThList, FaVectorSquare } from 'react-icons/fa';
import { LayoutItem } from '../Layouts/LayoutItem';
import type { LayoutIcons } from '../Layouts/toLayoutContainerDescriptors';

// The icon each layout container is drawn with, in the palette and in the layout drawer.
export const defaultLayoutIcons: LayoutIcons = {
    [LayoutItem.Stack]: FaBars,
    [LayoutItem.Row]: FaGripLinesVertical,
    [LayoutItem.Grid]: FaThLarge,
    [LayoutItem.Container]: FaRegSquare,
    [LayoutItem.Wrap]: FaThList,
    [LayoutItem.Canvas]: FaVectorSquare,
};
