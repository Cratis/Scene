// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import type { ChangeLayoutTypeEdit, LayoutType, NodeInspection } from '@cratis/scene.model';
import { findLayoutTypeDescriptor } from '@cratis/scene.engine';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import { changeLayoutType, readLayoutChange } from '../Layouts/layoutChange';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface LayoutTypeSectionProps {
    inspection: NodeInspection;
    controller: ScreenEditorController;
    strings: ScreenEditorStrings;
    disabled: boolean;
}

// Changes what kind of layout a container is, among the types Scene says it can become. A change that would drop
// something is not refused outright: the author is shown what would be lost and decides.
export const LayoutTypeSection = ({ inspection, controller, strings, disabled }: LayoutTypeSectionProps) => {
    const text = strings.properties;
    const [pending, setPending] = useState<{ lost: string; edit: ChangeLayoutTypeEdit }>();
    const descriptor = findLayoutTypeDescriptor(controller.context.catalog, inspection.typeId);
    const targets = descriptor?.capabilities.convertibleTo ?? [];
    if (!descriptor || targets.length === 0) return null;

    const attempt = (edit: ChangeLayoutTypeEdit) => {
        const applied = controller.tryApply(edit, text.changeLayout);
        const step = readLayoutChange(edit, applied.applied, applied.diagnostics);
        setPending(step.kind === 'confirm' ? { lost: step.lost, edit: step.edit } : undefined);
    };

    return (
        <section className='studio-editor-properties__layout'>
            <label>
                <span>{text.layoutType}</span>
                <select
                    value={inspection.typeId}
                    disabled={disabled}
                    onChange={event => attempt(changeLayoutType(inspection.nodeId, event.target.value as `${LayoutType}`))}
                >
                    <option value={inspection.typeId}>{descriptor.label}</option>
                    {targets.map(type => <option key={type} value={type}>{findLayoutTypeDescriptor(controller.context.catalog, type)?.label ?? type}</option>)}
                </select>
            </label>
            {pending && (
                <div className='studio-editor-properties__confirm' role='alertdialog' aria-label={text.confirmLayoutTitle}>
                    <strong>{text.confirmLayoutTitle}</strong>
                    <p>{pending.lost}</p>
                    <button type='button' onClick={() => { controller.apply(pending.edit, text.changeLayout); setPending(undefined); }}>{text.confirmLayoutAccept}</button>
                    <button type='button' onClick={() => setPending(undefined)}>{text.confirmLayoutCancel}</button>
                </div>
            )}
        </section>
    );
};
