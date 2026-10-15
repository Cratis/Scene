// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconReference } from '../icons';

/**
 * The icon library the built-in components' icons come from: the Lucide library package a Cratis host ships. A component's icon is an
 * ordinary {@link IconReference}, so a host without that library shows the component's badge instead (see the component picker) and
 * the icon diagnostics report it like any other icon.
 */
export const componentIconLibrary = 'Cratis.Icons.Lucide';

/** The icon with this key in {@link componentIconLibrary}. */
export function componentIcon(key: string): IconReference {
    return { library: componentIconLibrary, key };
}
