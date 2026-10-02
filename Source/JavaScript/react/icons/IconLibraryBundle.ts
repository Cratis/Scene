// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconCatalogSource } from '@cratis/scene.engine';
import { IconAdapter } from './IconAdapter';

/**
 * What an icon-library package ships to a React renderer, as opposed to what its manifest declares.
 *
 * The manifest says the library exists, what it is licensed under and which renderers it supports; this
 * is the code behind it. The catalog is the metadata a picker searches, loaded on demand; the adapter
 * turns one reference at a time into artwork. They are separate because a catalog is renderer-neutral
 * and an adapter is not.
 */
export interface IconLibraryBundle {
    /**
     * Where the library's icon catalog is loaded from.
     */
    catalog: IconCatalogSource;

    /**
     * How the library's references are drawn in React.
     */
    adapter: IconAdapter;
}
