// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import { DialogTemplateListEditor } from './DialogTemplateListEditor';

export interface DialogTemplateAuthoringSectionProps {
    controller: ScreenEditorController;
    strings: ScreenEditorStrings;
    disabled: boolean;
}

export const DialogTemplateAuthoringSection = ({ controller, strings, disabled }: DialogTemplateAuthoringSectionProps) => (
    <DialogTemplateListEditor
        templates={controller.document.dialogTemplates}
        referencedTemplates={referencedDialogTemplates(controller.document)}
        disabled={disabled}
        strings={strings.properties.dialogTemplates}
        onChange={templates => controller.setDialogTemplates(templates, strings.properties.dialogTemplates.label)}
    />
);

function referencedDialogTemplates(document: SceneDocument): ReadonlySet<string> {
    const references = new Set<string>();
    visit(document.screens, references);
    visit(document.screenTemplates, references);
    visit(document.instanceContributions, references);
    return references;
}

function visit(value: unknown, references: Set<string>): void {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
        for (const item of value) visit(item, references);
        return;
    }

    const record = value as Record<string, unknown>;
    if (typeof record.dialog === 'string' && record.dialog.length > 0) references.add(record.dialog);
    for (const child of Object.values(record)) visit(child, references);
}
