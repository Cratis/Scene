// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { designModeActions, type DesignModeItem } from './designModeTypes';
import type { DesignModeStrings } from './DesignModeStrings';

export const actionAnnouncement = (strings: DesignModeStrings, actionId: string, item: DesignModeItem): string => {
    const label = item.label;
    switch (actionId) {
        case designModeActions.moveEarlier: return strings.announce.moved(label, item.index, item.count);
        case designModeActions.moveLater: return strings.announce.moved(label, item.index + 2, item.count);
        case designModeActions.duplicate: return strings.announce.duplicated(label);
        case designModeActions.delete: return strings.announce.removed(label);
        default: return '';
    }
};

// The reason is what the model said, else the first diagnostic, else the label of the edit.
export const refusalReasonOf = (result: { rejected?: string; diagnostics?: readonly { message: string }[] }, label: string): string =>
    result.rejected || result.diagnostics?.[0]?.message || label;
