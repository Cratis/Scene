// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ToolbarEmphasis } from '../toolbar/ToolbarEmphasis';
import { Outlet } from './Outlet';
import { OutletBuiltInAction } from './OutletBuiltInAction';
import { OutletItemKind } from './OutletItemKind';
import { OutletKind } from './OutletKind';

/** The name of the outlet of actions every dialog and drawer template offers. */
export const dialogActionsOutletName = 'actions';

/**
 * The outlet of actions every dialog and drawer template declares: `outlet actions of actions` with Cancel
 * (`runs close`) and Submit (`runs submit`, primary). A template that declares its own `actions` outlet replaces it.
 */
export const dialogActionsOutlet: Outlet = {
    name: dialogActionsOutletName,
    kind: OutletKind.Actions,
    defaults: [
        { kind: OutletItemKind.Button, id: 'cancel', title: 'Cancel', runs: OutletBuiltInAction.Close },
        { kind: OutletItemKind.Button, id: 'submit', title: 'Submit', runs: OutletBuiltInAction.Submit, emphasis: ToolbarEmphasis.Primary },
    ],
};
