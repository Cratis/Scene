// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DialogTemplate, EffectiveConfiguration, Layout, SceneDocument, SceneElement, ScreenTemplate } from '@cratis/scene.model';
import { EditingScopeKind } from '@cratis/scene.model';
import { resolveEffectiveConfiguration } from '@cratis/scene.engine';
import { resolveTemplateChain, type DescriptorCatalog, type OutletChain } from '@cratis/scene.engine';
import { composeEditorScreen } from '../Templates/composeEditorScreen';
import { screenName } from '../Document/studioScreen';
import { dialogFrameOf, type DialogFrameDescription } from '../Templates/dialogPresentation';
import { ownContentOnly } from '../Templates/ownContentOnly';
import { dialogTemplateOf, showsDialogActions } from '../Templates/dialogActionsChrome';
import { screenOutletChain } from '../Outlets/screenOutletChain';

// The screen as it is shown when played: the same composition the editor draws, and the configuration its templates were given.
export interface PlayScreen {
    element: SceneElement;

    // What each scope configured on the components the templates contribute. Absent when nothing was configured.
    configuration?: EffectiveConfiguration;

    // The popup the screen is drawn as when it opens as a dialog or a drawer; absent for a page. The element is then the screen's own content only.
    dialog?: DialogFrameDescription;

    // The outlets the screen's levels declare - its templates', its layout's and, for a dialog, the dialog template's button row - resolved as the editor
    // resolves them, so an outlet draws the same actions here as there. Absent when no level declares one.
    outlets?: OutletChain;
}

// Composes a screen for Play. It is the editor's own composition - template content around the screen's own - plus the
// effective configuration Scene resolves from the instance contributions, so what Play shows is exactly what the editor
// showed, and nothing of the editor (selection, drop targets, ownership fading) comes with it.
//
// A screen that opens as a dialog or a drawer is composed as that popup: its own content, with no page template around it (a popup opens over the page,
// it is not part of it), with the dialog's button row after it, as the editor draws it - unless the screen's template or layout declares its own outlet of
// actions, which then draws the row. The application's shell is never composed here; the host that draws the popup puts it on a neutral backdrop (`dialog`).
export function composePlayScreen(document: SceneDocument, catalog: DescriptorCatalog, knownDialogTemplates: readonly DialogTemplate[] = [], pageTemplateNames: readonly string[] = [], opensOverPage = false, screenTemplates: readonly ScreenTemplate[] = [], layouts: readonly Layout[] = []): PlayScreen {
    const dialog = dialogFrameOf(document, knownDialogTemplates, pageTemplateNames, opensOverPage);
    const dialogActions = dialog !== undefined && showsDialogActions(document, screenTemplates, layouts, opensOverPage, knownDialogTemplates);
    const composition = composeEditorScreen(document, undefined, { dialogActions });
    const outlets = screenOutletChain({ document, screen: screenName, templates: screenTemplates, layouts, ...(dialogActions ? { dialogTemplate: dialogTemplateOf(document, knownDialogTemplates) } : {}) });
    const chain = resolveTemplateChain(document, { kind: EditingScopeKind.Screen, name: screenName });
    const configuration = document.instanceContributions.length > 0
        ? resolveEffectiveConfiguration(chain, document.instanceContributions, catalog)
        : undefined;
    return {
        element: dialog ? ownContentOnly(composition) : composition.element,
        configuration,
        ...(dialog ? { dialog } : {}),
        ...(outlets.chain.length > 0 ? { outlets } : {}),
    };
}
