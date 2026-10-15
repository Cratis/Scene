// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { foundationDialogTemplates, stateScreenTemplates } from '../foundation/templates';
import { galleryDialogTemplates } from '../gallery';

export { foundationPack, packageRoot } from '../for_foundationTemplates/given';

/** The five dialog templates of Part B 2.10: QuickCreate, Confirm, Lookup, SideSheet and Filter. */
export const specDialogNames = ['QuickCreateDialog', 'ConfirmDialog', 'LookupDialog', 'SideSheet', 'FilterDialog'];

/** Every dialog template the blueprint ships: the five of the spec, and the form and detail dialogs it began with. */
export const dialogNames = galleryDialogTemplates.map(template => template.name);

/** The foundation's own dialogs, and the four auth and state screens of Part B 2.11. */
export const addedDialogNames = foundationDialogTemplates.map(template => template.name);
export const stateScreenNames = stateScreenTemplates.map(template => template.name);

/** The dialogs built from the foundation and core components alone, which a bundle with no component library draws; the form and detail dialogs use PrimeReact widgets. */
export const foundationOnlyDialogNames = dialogNames.filter(name => !['FormDialog', 'DetailDialog'].includes(name));
