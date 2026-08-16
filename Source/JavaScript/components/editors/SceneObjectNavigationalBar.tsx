// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { ObjectNavigationalBar } from '@cratis/components/ObjectNavigationalBar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringArrayProperty, stringProperty } from '../properties';
import { useEditableCopy } from './useEditableCopy';

/**
 * The `Cratis.Components:objectNavigationalBar` component - `ObjectNavigationalBar` from
 * `@cratis/components/ObjectNavigationalBar`.
 *
 * The breadcrumb trail that says where you are inside a nested document, and lets you climb back out.
 * Clicking a crumb truncates the trail to it, which is behavior the component reports rather than
 * performs - so this adapter holds the trail and applies the truncation, and the bar is a working
 * breadcrumb on a screen instead of a row of inert labels.
 *
 * The reported index is how many segments to *keep*, not the position of the crumb clicked: the bar
 * prepends a `Root` crumb at index 0, so clicking the first real segment reports 1. `slice(0, index)` is
 * what that means, and it is also exactly what the back arrow asks for when it reports `length - 1`.
 */
export function SceneObjectNavigationalBar({ element }: RegisteredComponentProps) {
    const declared = useMemo(() => stringArrayProperty(element.properties, 'navigationPath') ?? [], [element.properties]);
    const [navigationPath, setNavigationPath] = useEditableCopy(declared);

    return (
        <ObjectNavigationalBar
            navigationPath={navigationPath}
            onNavigate={index => setNavigationPath(navigationPath.slice(0, index))}
            className={stringProperty(element.properties, 'className')}
        />
    );
}
