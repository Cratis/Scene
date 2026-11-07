// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, Outlet, dialogActionsOutlet, dialogActionsOutletName } from '@cratis/scene.model';

/**
 * The outlets a dialog or drawer template offers: the ones it declares, with the standard `actions` outlet (Cancel and
 * Submit) first unless the template declares its own.
 * @param template The dialog template.
 * @returns The outlets, in order.
 */
export function dialogTemplateOutlets(template: DialogTemplate): Outlet[] {
    const declared = template.outlets ?? [];
    return declared.some(outlet => outlet.name === dialogActionsOutletName) ? declared : [dialogActionsOutlet, ...declared];
}
