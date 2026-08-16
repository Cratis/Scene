// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useRef, useState } from 'react';
import { FilterPanel, useFilterState } from '@cratis/components/Filter';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';
import { filterDefinitions } from './filterDefinitions';

/**
 * The `Cratis.Components:filterPanel` component - `FilterPanel` from `@cratis/components/Filter`.
 *
 * `FilterPanel` is a portal anchored to a button: it renders next to whatever opened it, which means it
 * cannot be placed on a screen on its own. So this adapter is the whole control - the toggle button and
 * the panel it anchors - and a screen places one element instead of having to model an anchor
 * relationship the element tree has no way to express.
 *
 * Selection state comes from the library's own `useFilterState`, so the toggling, clearing and range
 * behavior is the library's rather than a second implementation of it here.
 */
export function SceneFilterPanel({ element, slots }: RegisteredComponentProps) {
    const filters = useMemo(() => filterDefinitions(element.properties), [element.properties]);
    const anchorRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const state = useFilterState(filters);

    return (
        <>
            <button type='button' ref={anchorRef} data-scene-id={element.id} onClick={() => setIsOpen(open => !open)}>
                {stringProperty(element.properties, 'label') ?? 'Filters'}
            </button>
            <FilterPanel
                isOpen={isOpen}
                filters={filters}
                filterValues={state.filterValues}
                rangeValues={state.rangeValues}
                customValues={state.customValues}
                searchPlaceholder={stringProperty(element.properties, 'searchPlaceholder')}
                expandedFilterKey={state.expandedFilterKey}
                anchorRef={anchorRef}
                onClose={() => setIsOpen(false)}
                onFilterToggle={state.handleToggleFilter}
                onFilterClear={state.handleClearFilter}
                onRangeChange={state.handleRangeChange}
                onExpandedFilterChange={state.setExpandedFilterKey}
                onCustomValueChange={state.handleCustomValueChange}
            >
                {slots.content}
            </FilterPanel>
        </>
    );
}
