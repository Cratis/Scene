// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentDescriptor } from '@cratis/scene.model';
import type { ReactNode } from 'react';
import type { LayoutItem } from '../Layouts/LayoutItem';

export interface PaletteSource {

    // The package that offers the component, shown as a secondary label.
    package: string;
    components: readonly string[];

    // The descriptors that say how each component is presented - category, display name, badge, keywords (CMP1). The picker lists nothing
    // from anywhere else.
    descriptors?: readonly ComponentDescriptor[];
}

export interface PaletteIcons {
    layout: (item: LayoutItem) => ReactNode;
    component: (componentName: string) => ReactNode;

    // The icon on the Components folder's button (`layout`), and one per package by its name for hosts that tell packages apart.
    drawer: { layout: ReactNode; package: (packageName: string) => ReactNode };
}
