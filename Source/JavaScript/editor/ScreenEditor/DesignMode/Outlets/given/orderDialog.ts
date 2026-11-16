// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenFit, type DialogTemplate, type SceneDocument } from '@cratis/scene.model';
import { dialogTemplateOf } from '../../../Templates/dialogActionsChrome';
import { defaultOutletStrings } from '../OutletStrings';
import { createOutletDesign, type OutletDesign } from '../createOutletDesign';
import type { OutletDocument } from '../../../Outlets/outletDocument';
import { screenOutletChain } from '../../../Outlets/screenOutletChain';
import { binding, newId, screen, theScreen } from './productCatalog';

// A screen that fits a dialog, in a document that has declared no dialog template of its own: it opens in the standard one, with Cancel and Submit.
export function orderDialogDocument(more: Partial<OutletDocument> = {}): SceneDocument {
    return {
        layouts: [{ name: 'StudioScreen', slots: [{ name: 'content' }] }],
        screenTemplates: [],
        dialogTemplates: [],
        screens: [{ name: screen, layout: 'StudioScreen', slotContent: {}, fits: [ScreenFit.Dialog] }],
        exposures: [],
        instanceContributions: [],
        ...more,
    } as SceneDocument;
}

export function actionsOf(document: SceneDocument, template: DialogTemplate = dialogTemplateOf(document)): OutletDesign {
    const outlets = screenOutletChain({ document, screen, dialogTemplate: template });
    const design = createOutletDesign({ document, outlets, outlet: 'actions', level: theScreen, newId, binding, strings: defaultOutletStrings });
    if (!design) throw new Error('no outlet actions');
    return design;
}
