// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateCatalogKind } from '@cratis/scene.engine';
import { TemplateBrowserActionKind } from './TemplateBrowserActionKind';
import type { TemplateBrowserActions } from './TemplateBrowserActions';
import type { TemplateBrowserEntry } from './TemplateBrowserEntry';
import { TemplateBrowserMode } from './TemplateBrowserMode';
import { TemplateOrigin } from './TemplateOrigin';

/**
 * Which actions the browser offers on a template, in the order they are shown.
 *
 * Choosing needs a template that fits the target, that Scene says the host can run, and whose package is in the profile - for one that is not, the way
 * forward is to add the blueprint, so that is what is offered. Managing is for the page and for the application's own templates only: a blueprint's
 * template is read-only and a screen template of it can be copied (a shell or a dialog template is not a screen template, so it stays the blueprint's). A host that does not handle an action never sees it offered.
 *
 * @param entry The template.
 * @param mode Where the browser is hosted.
 * @param actions What the host handles.
 * @returns The actions, in order.
 */
export function availableActions(entry: TemplateBrowserEntry, mode: TemplateBrowserMode, actions: TemplateBrowserActions): TemplateBrowserActionKind[] {
    const offered: TemplateBrowserActionKind[] = [];
    const own = entry.origin === TemplateOrigin.Own;
    const usable = entry.compatible && entry.applicability.applies;

    if (actions.onChoose && usable && entry.installed && !entry.current) offered.push(TemplateBrowserActionKind.Choose);
    if (!entry.installed && entry.package !== undefined && actions.onAddBlueprint) offered.push(TemplateBrowserActionKind.AddBlueprint);
    if (!own && entry.kind === TemplateCatalogKind.ScreenTemplate && entry.compatible && actions.onCopyToMine) offered.push(TemplateBrowserActionKind.CopyToMine);
    if (own && mode === TemplateBrowserMode.Manage) {
        if (actions.onEdit) offered.push(TemplateBrowserActionKind.Edit);
        if (actions.onRename) offered.push(TemplateBrowserActionKind.Rename);
        if (actions.onDuplicate) offered.push(TemplateBrowserActionKind.Duplicate);
        if (actions.onExport) offered.push(TemplateBrowserActionKind.Export);
        if (actions.onRemove) offered.push(TemplateBrowserActionKind.Remove);
    }

    return offered;
}
