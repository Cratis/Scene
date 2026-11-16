// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { NavigationRegionKind } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { defaultDesignModeStrings } from '../DesignMode/DesignModeStrings';
import { designModeActions, isRejection, type DesignModeItem, type DesignModePlan, type DesignModeRejection } from '../DesignMode/designModeTypes';
import { createRegionItemSource } from '../DesignMode/Navigation/regionItemSource';
import { nextElementId } from '../Host/nextElementId';
import { NavigationSection } from './NavigationSection';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface ShellNavigationSectionProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
}

// What the section says. The words of the items themselves (the mode cards, the logo, the fields) are the navigation strings of the design mode.
export const shellNavigationStrings = {
    title: 'Application navigation',
    hint: 'The topbar and the sidebar the application shows around every screen. Changes are saved with the screen and exported with the application.',
    level: 'Edit the navigation of',
    region: 'Region',
    items: 'Items',
    empty: 'No items here yet.',
    add: 'Add item',
    addSub: 'Add sub-item',
    earlier: 'Move earlier',
    later: 'Move later',
    duplicate: 'Duplicate',
    remove: 'Remove',
    inherited: 'inherited',
    notLinked: 'not linked',
} as const;

const regions = [NavigationRegionKind.Topbar, NavigationRegionKind.Sidebar] as const;

// The application's navigation, edited without having to select the shell's topbar or sidebar on the canvas - the shell around the screen is drawn read-only, so
// that selection is not possible there (StudioIssues#948). The same source of items the design mode on a selected region uses plans every change, so what is
// authored here is the same navigation edit - one undo step, saved in the document, exported as Screenplay `navigation` blocks.
export const ShellNavigationSection = ({ controller, environment, strings }: ShellNavigationSectionProps) => {
    const text = shellNavigationStrings;
    const design = (strings.designMode ?? defaultDesignModeStrings).navigation;
    const [region, setRegion] = useState<NavigationRegionKind>(NavigationRegionKind.Topbar);
    const [itemId, setItemId] = useState<string | undefined>();
    const { navigation, structure, navigationModule } = controller;
    if (!environment.navigation) return null;

    const slots = environment.navigation.slots ?? environment.propertyEditors?.slots ?? ['content'];
    const source = createRegionItemSource({
        region, module: navigationModule, navigation, structure, newId: nextElementId, slots, startingLabel: 'New item',
        strings: { tagLong: design.tagLong, extendsNotice: design.extendsNotice, overrideHere: design.overrideHere, editAtApplication: design.editAtApplication, application: design.application, mainArea: 'Main area' },
    });
    const selected = source.items.find(candidate => candidate.id === itemId);
    const own = selected !== undefined && !selected.readOnly;

    const carryOut = (outcome: DesignModePlan | DesignModeRejection) => {
        if (isRejection(outcome) || !outcome.navigationEdits) return;
        if (!controller.applyNavigationEdits(outcome.navigationEdits, outcome.label).applied) return;
        if (outcome.select?.itemId !== undefined) setItemId(outcome.select.itemId === null ? undefined : outcome.select.itemId);
    };
    const act = (actionId: string, item: DesignModeItem) => carryOut(source.act(actionId, item));
    const changeLevel = (level: string) => { setItemId(undefined); controller.setNavigationModule(level === '' ? undefined : level); };
    const changeRegion = (next: NavigationRegionKind) => { setItemId(undefined); setRegion(next); };

    return (
        <section className='studio-editor-properties__shell-navigation' data-shell-navigation data-region={region} data-scope={navigationModule ?? 'application'}>
            <header className='studio-editor-properties__header'><strong>{text.title}</strong></header>
            <p className='studio-editor-properties__hint'>{text.hint}</p>

            <label className='studio-editor-properties__field'>
                {text.level}
                <select data-shell-level value={navigationModule ?? ''} onChange={event => changeLevel(event.target.value)}>
                    <option value=''>{design.application}</option>
                    {structure.modules.map(module => <option key={module.id} value={module.id}>{module.name}</option>)}
                </select>
            </label>

            <div role='tablist' aria-label={text.region} className='studio-editor-properties__tabs'>
                {regions.map(candidate => (
                    <button key={candidate} type='button' role='tab' aria-selected={candidate === region} data-shell-region={candidate} onClick={() => changeRegion(candidate)}>
                        {design.regionName[candidate]}
                    </button>
                ))}
            </div>

            <p className='studio-editor-properties__hint'><strong>{text.items}</strong> {source.regionTag?.long}</p>
            {source.items.length === 0 && <p className='studio-editor-properties__hint'>{text.empty}</p>}
            <ul className='studio-editor-properties__items' aria-label={text.items}>
                {source.items.map(item => (
                    <li key={item.id} data-shell-item={item.id} data-parent={item.parentId} data-read-only={item.readOnly || undefined} style={{ paddingInlineStart: item.parentId ? '1.5rem' : 0 }}>
                        <button type='button' aria-pressed={item.id === itemId} onClick={() => setItemId(item.id === itemId ? undefined : item.id)}>
                            {item.label}
                            {item.readOnly && <em> · {text.inherited}</em>}
                            {item.unlinked && <em> · {text.notLinked}</em>}
                        </button>
                    </li>
                ))}
            </ul>

            <div role='toolbar' aria-label={text.items} className='studio-editor-properties__actions'>
                <button type='button' data-shell-action='addItem' onClick={() => carryOut(source.add(designModeActions.addItem))}>{text.add}</button>
                {selected && own && selected.parentId === undefined && region === NavigationRegionKind.Sidebar && <button type='button' data-shell-action='addSubItem' onClick={() => act(designModeActions.addSubItem, selected)}>{text.addSub}</button>}
                {selected && own && <button type='button' data-shell-action='moveEarlier' disabled={selected.index <= 0} onClick={() => act(designModeActions.moveEarlier, selected)}>{text.earlier}</button>}
                {selected && own && <button type='button' data-shell-action='moveLater' disabled={selected.index >= selected.count - 1} onClick={() => act(designModeActions.moveLater, selected)}>{text.later}</button>}
                {selected && own && <button type='button' data-shell-action='duplicate' onClick={() => act(designModeActions.duplicate, selected)}>{text.duplicate}</button>}
                {selected && own && <button type='button' data-shell-action='delete' onClick={() => act(designModeActions.delete, selected)}>{text.remove}</button>}
            </div>

            <NavigationSection controller={controller} environment={environment} strings={strings} region={region} {...(selected ? { itemId: selected.id } : {})} />
        </section>
    );
};
