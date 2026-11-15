// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignModePlan } from './designModeTypes';
import type { DesignModeStrings } from './DesignModeStrings';
import type { RegionSourceInputs } from './Navigation/regionItemSource';

export interface SelectionTarget {
    select: (elementId: string | undefined) => void;
    selectItem: (componentId: string | undefined, itemId: string | undefined) => void;
}

// An applied plan names an element, an item (of the given component), or - for a removed item - no item.
export function applyPlanSelection(target: SelectionTarget, select: DesignModePlan['select'], componentId: string | undefined): void {
    if (select?.elementId !== undefined) target.select(select.elementId);
    if (select?.itemId === undefined) return;
    if (select.itemId === null) target.selectItem(undefined, undefined);
    else target.selectItem(componentId, select.itemId);
}

export function regionStringsOf(strings: DesignModeStrings): RegionSourceInputs['strings'] {
    const navigation = strings.navigation;
    return {
        tagLong: navigation.tagLong, extendsNotice: navigation.extendsNotice, overrideHere: navigation.overrideHere,
        editAtApplication: navigation.editAtApplication, application: navigation.application, mainArea: strings.mainArea,
    };
}
