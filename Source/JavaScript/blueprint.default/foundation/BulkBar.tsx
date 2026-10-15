// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { ActionButton } from './ActionButton';
import { formatText, readFoundationStrings } from './foundationStrings';
import { readPermissionRule } from './PermissionRule';

/** How many records a selection holds: an array's length, a number as given, anything else none. */
export function selectionCount(selection: unknown): number {
    if (Array.isArray(selection)) return selection.length;
    return typeof selection === 'number' && Number.isFinite(selection) && selection > 0 ? Math.floor(selection) : 0;
}

/**
 * The `bulkBar` component: appears when records are selected, says how many, offers the bulk actions and clears the selection.
 *
 * `selection` is the selected records (or their count) - a list screen binds it to the table's selection output - and the bar is not rendered
 * at all while nothing is selected. It is announced politely when it appears or its count changes. `actions` (strings) are the bulk actions; each
 * runs the behaviors attached to the element and honours `actionPermission` (enabled, disabled with its reason, or hidden). "Clear selection"
 * runs the same behaviors with no action, which a screen wires to emptying the table's selection.
 */
export function BulkBar({ element, interactions }: RegisteredComponentProps) {
    const count = selectionCount(element.properties.selection);
    const strings = readFoundationStrings(element);
    const actions = Array.isArray(element.properties.actions) ? element.properties.actions.filter((action): action is string => typeof action === 'string') : [];
    const rule = readPermissionRule(element, 'actionPermission');

    return (
        <div className='foundation foundation-bulk-bar' data-scene-id={element.id} role='region' aria-label={strings.bulkActions} hidden={count === 0}>
            <span className='foundation-bulk-count' role='status'>{count > 0 ? formatText(strings.bulkSelected, { count }) : ''}</span>
            <span className='foundation-bulk-actions'>
                {actions.map(action => <ActionButton key={action} rule={rule} emphasis='secondary' disabledReason={strings.disabledNoPermission} onClick={interactions?.onClick}>{action}</ActionButton>)}
            </span>
            <ActionButton emphasis='quiet' disabledReason={strings.disabledNoPermission} onClick={interactions?.onClick}>{strings.bulkClear}</ActionButton>
        </div>
    );
}
