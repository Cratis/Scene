// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { ApplicationStructureIndex, outletActionAsToolbarButton, resolveToolbarButton, toolbarButtonFromItem } from '@cratis/scene.engine';
import { OutletItemKind, type OutletItem, type SceneElement, type ToolbarButton } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import { defaultDesignModeStrings } from '../DesignMode/DesignModeStrings';
import { slicesOfStructure } from '../Toolbar/slicesOfStructure';
import { isToolbarElement, toolbarDiagnostics } from '../Toolbar/toolbarDiagnostics';
import { upgradeEdits, upgradeOf } from '../Toolbar/upgradeToolbarButton';
import { DiagnosticList } from './DiagnosticList';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface ToolbarButtonSectionProps {
    controller: ScreenEditorController;
    strings: ScreenEditorStrings;
    element: SceneElement;
}

const isToolbarItem = (element: SceneElement) => String((element as unknown as { componentName?: string }).componentName ?? '').endsWith('toolbarItem');
const isToolbar = (element: SceneElement) => isToolbarElement(element);
const isOutletOfActions = (element: SceneElement) => /(^|:)outletItems$/.test(String((element as unknown as { componentName?: string }).componentName ?? '')) && isToolbarElement(element);

// The button of an outlet of actions the design mode has selected: since Scene 5 a toolbar's buttons are items of the outlet, not elements of their own.
const selectedOutletButton = (element: SceneElement, properties: Record<string, unknown>, itemId: string | undefined): { item: OutletItem; button: ToolbarButton } | undefined => {
    if (itemId === undefined || !isOutletOfActions(element)) return undefined;
    const item = (Array.isArray(properties.items) ? properties.items as OutletItem[] : []).find(candidate => (candidate as { id?: string }).id === itemId);
    if (!item || item.kind !== OutletItemKind.Button) return undefined;
    const button = outletActionAsToolbarButton(item as never);
    return button ? { item, button } : undefined;
};

// The Properties tab's account of a toolbar button (spec p15-1, TB3-TB5): what feature it belongs to and that it opens as a dialog, the dialog Scene derives for it - the
// slice's own template when it names one, else the default form dialog - and what is wrong with it: no slice (a warning), a slice that is gone, one that is not a State
// Change. Selecting the toolbar itself lists the findings of all its buttons. Every statement is Scene's (`resolveToolbarButton`, `validateToolbarButtons`); nothing here decides it.
export const ToolbarButtonSection = ({ controller, strings, element }: ToolbarButtonSectionProps) => {
    const text = (strings.designMode ?? defaultDesignModeStrings).toolbar;
    const { structure } = controller;
    const properties = (element as unknown as { properties?: Record<string, unknown> }).properties ?? {};
    const outletButton = useMemo(() => selectedOutletButton(element, properties, controller.selectedItemId), [element, properties, controller.selectedItemId]);
    const item = isToolbarItem(element) || outletButton !== undefined;
    const toolbar = isToolbar(element);

    const view = useMemo(() => {
        if (!item || structure.modules.length === 0) return undefined;
        const button = outletButton?.button ?? toolbarButtonFromItem((element as { id: string }).id, properties);
        if (!button) return undefined;
        const resolved = resolveToolbarButton(new ApplicationStructureIndex(structure), button);
        const slice = resolved.slice ? slicesOfStructure(structure).find(candidate => candidate.id === resolved.slice) : undefined;
        return { resolved, feature: slice ? slice.path[slice.path.length - 1] : undefined };
    }, [item, outletButton, structure, element, properties]);

    const findings = useMemo(() => {
        if (structure.modules.length === 0) return [];
        const all = item ? [] : toolbar ? toolbarDiagnostics(structure, element) : [];
        return all;
    }, [item, toolbar, structure, element]);

    // The finding of a single button is read through a one-button toolbar, so it is the same wording the toolbar lists.
    const own = useMemo(() => {
        if (!item || structure.modules.length === 0) return [];
        const wrapper = outletButton
            ? { ...element, properties: { ...properties, items: [outletButton.item] } } as unknown as SceneElement
            : { slots: { items: [element] } } as unknown as SceneElement;
        return toolbarDiagnostics(structure, wrapper);
    }, [item, outletButton, structure, element, properties]);

    const upgrade = useMemo(() => item && !outletButton ? upgradeOf(structure, (element as { id: string }).id, properties) : undefined, [item, outletButton, structure, element, properties]);

    if (!item && !toolbar) return null;
    const shown = item ? own : findings;
    const dialog = view?.resolved.dialog;

    return (
        <section className='studio-editor-properties__toolbar-button' data-section='toolbarButton'>
            {item && view && (
                <>
                    <strong className='studio-editor-properties__button-title'>{text.toolbarButton}</strong>
                    <div className='studio-editor-properties__chips'>
                        {view.feature && <span className='studio-editor-chip' data-chip='feature'>{view.feature}</span>}
                        {dialog && <span className='studio-editor-chip' data-chip='dialog'>{text.opensAsDialog}</span>}
                    </div>
                    {upgrade && (
                        <p className='studio-editor-callout' role='note' data-upgrade={upgrade.slice}>
                            {text.upgradeNote(upgrade.slice)}
                            <button type='button' data-action='upgrade' onClick={() => controller.applyAll(upgradeEdits((element as { id: string }).id, upgrade.slice), text.upgrade)}>{text.upgrade}</button>
                        </p>
                    )}
                    {dialog && (
                        <p className='studio-editor-properties__hint' data-dialog={dialog.template} data-source={dialog.source}>
                            {dialog.source === 'slice' ? text.dialogFromSlice(dialog.template) : text.dialogDefault(dialog.template)}
                        </p>
                    )}
                </>
            )}
            <DiagnosticList diagnostics={shown} label={strings.properties.diagnostics} />
        </section>
    );
};
