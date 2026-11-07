// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarEmphasis } from '../toolbar/ToolbarEmphasis';
import { OutletAction } from './OutletAction';
import { OutletItemKind } from './OutletItemKind';

/**
 * A button of an outlet of actions: Screenplay's `button <id> title "…"`. A button with a slice is a hook.
 */
export interface OutletButton extends OutletAction {
    /** Always a button. */
    kind: OutletItemKind.Button;

    /** How prominent the button is; secondary when absent. */
    emphasis?: ToolbarEmphasis;
}

/** The own property names of {@link OutletButton}, checked against the shared shape manifest. */
export const OutletButtonPropertyNames: (keyof OutletButton)[] = ['kind', 'emphasis'];
