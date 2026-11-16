// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { OutletMode, PropertyValueType, ValueSource, type InspectedProperty, type NavigationRegionKind } from '@cratis/scene.model';
import { setApplicationLogo, switchOutletMode } from '@cratis/scene.engine';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { createBindingScope } from '../Binding/bindingScopeTypes';
import { defaultDesignModeStrings } from '../DesignMode/DesignModeStrings';
import { createRegionItemSource } from '../DesignMode/Navigation/regionItemSource';
import { regionOf } from '../DesignMode/useDesignMode';
import { nextElementId } from '../Host/nextElementId';
import { createEditorContext } from '../PropertyEditors/Registry/createEditorContext';
import { PropertyEditorHost } from '../PropertyEditors/Registry/PropertyEditorHost';
import { screenEditorPropertyEditors } from '../PropertyEditors/Registry/screenEditorPropertyEditors';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface NavigationSectionProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;

    // The region and the item to show, when they are not those of the selected topbar or sidebar: the application's shell is edited without anything selected on the
    // canvas (StudioIssues#948). `itemId` is the item chosen in the shell list, nothing for the region itself.
    region?: NavigationRegionKind;
    itemId?: string;
}

export const slotNames = (text: { mainArea: string; sidePanel: string }): Record<string, string> => ({ content: text.mainArea, aside: text.sidePanel });

// How a module takes the application's topbar or sidebar - an outlet of navigation it inherits, extends or overrides (Scene 5).
type RegionMode = 'inherit' | 'extend' | 'override';
const modes: readonly RegionMode[] = ['inherit', 'extend', 'override'];
const outletModes: Record<RegionMode, OutletMode> = { inherit: OutletMode.Inherits, extend: OutletMode.Extends, override: OutletMode.Overrides };

const field = (path: string, label: string, valueType: PropertyValueType, editorKind: string, value: unknown, editable: boolean, reason?: string): InspectedProperty => ({
    descriptor: { path, label, group: 'Content', valueType, editorKind },
    currentValue: value, effectiveValue: value, source: ValueSource.Local, editable, ...(reason ? { reason } : {}),
});

// The Properties tab of a selected topbar or sidebar: the region and the level being edited, the inheritance mode picker of a module (NAV2-NAV5, spec p13-1), the logo
// (NAV8), and - when an item is selected - its properties (p13-2, p18-1) or, for one a level above defines, why it cannot be changed here (p18-2). Everything shown is what
// Scene resolves for the module being edited; every change is a navigation edit that goes through the same session as the rest.
export const NavigationSection = ({ controller, environment, strings, region: given, itemId }: NavigationSectionProps) => {
    const text = (strings.designMode ?? defaultDesignModeStrings).navigation;
    const { selection, navigation, structure, navigationModule } = controller;
    const selectedItemId = given ? itemId : controller.selectedItemId;
    const region = given ?? (selection && 'componentName' in selection ? regionOf(String((selection as { componentName: string }).componentName)) : undefined);
    const [asking, setAsking] = useState(false);
    const scope = useMemo(() => createBindingScope(environment.availableSources), [environment.availableSources]);
    if (!region) return null;

    const slots = environment.navigation?.slots ?? environment.propertyEditors?.slots ?? ['content'];
    const source = createRegionItemSource({
        region, module: navigationModule, navigation, structure, newId: nextElementId, slots, startingLabel: 'New item',
        strings: { tagLong: text.tagLong, extendsNotice: text.extendsNotice, overrideHere: text.overrideHere, editAtApplication: text.editAtApplication, application: text.application, mainArea: 'Main area' },
    });
    const moduleName = structure.modules.find(candidate => candidate.id === navigationModule)?.name ?? navigationModule;
    const scopeName = moduleName ?? text.application;
    const regionName = text.regionName[region];
    const item = selectedItemId ? source.items.find(candidate => candidate.id === selectedItemId) : undefined;
    const registry = environment.propertyEditors?.registry ?? screenEditorPropertyEditors;
    const context = createEditorContext({ controller, environment, strings, ownership: undefined, diagnostics: [], inCanvas: false, bindingScope: scope, slotNames: slotNames(text) });
    const mode = source.region?.mode;

    const switchTo = (next: RegionMode, copy = false) => {
        const plan = switchOutletMode(navigation, navigationModule, region, outletModes[next], { copy });
        if (plan.rejected || plan.edits.length === 0) return;
        controller.applyNavigationEdits(plan.edits, 'Region mode');
    };
    const choose = (next: RegionMode) => {
        if (next === mode) return;
        if (mode === 'inherit' && next === 'override') { setAsking(true); return; }
        setAsking(false);
        switchTo(next);
    };

    const own = item ? !item.readOnly : false;
    const apply = (outcome: ReturnType<typeof source.rename> | undefined) => {
        if (!outcome || 'rejected' in outcome) return;
        if (outcome.navigationEdits) controller.applyNavigationEdits(outcome.navigationEdits, outcome.label);
    };
    const edit = (property: InspectedProperty, value: unknown) => {
        if (!item) return;
        switch (property.descriptor.path) {
            case 'label': if (typeof value === 'string' && value !== '') apply(source.rename(item, value)); break;
            case 'target': apply(source.choice('target', item)?.plan(value)); break;
            case 'slot': apply(source.choice('slot', item)?.plan(value)); break;
            case 'icon': apply(source.choice('icon', item)?.plan(value)); break;
        }
    };

    // Where the item sits in the application's navigation, outermost first - the module it is declared in (the application when it is a level above) and the items
    // it is nested under - which is the `hierarchy` Scene lays a NavigationItem out by. It is read from the structure, never typed in.
    const hierarchy = (() => {
        if (!item) return [];
        const chain: string[] = [];
        for (let current = item; ; ) {
            chain.unshift(current.label);
            const parent = current.parentId ? source.items.find(candidate => candidate.id === current.parentId) : undefined;
            if (!parent) break;
            current = parent;
        }
        return [item.readOnly ? text.application : scopeName, ...chain];
    })();

    const logo = navigation.application.logo;
    const logoEdit = (change: { image?: string; title?: string }) => {
        const planned = setApplicationLogo(navigation, navigationModule, { image: logo?.image ?? '', title: logo?.title ?? '', ...change });
        if (!planned.rejected) controller.applyNavigationEdits(planned.edits, 'Logo');
    };

    return (
        <section className='studio-editor-properties__navigation' data-region={region} data-scope={navigationModule ?? 'application'}>
            {item ? (
                <>
                    <header className='studio-editor-properties__header'>
                        <strong>{text.navigationItem}</strong>
                        <span className={`studio-editor-chip${item.readOnly ? ' studio-editor-chip--inherited' : ''}`}>{item.readOnly ? text.inheritedReadOnly : text.definedIn(scopeName)}</span>
                        <span className='studio-editor-chip'>{regionName}</span>
                    </header>
                    {item.readOnly && <p className='studio-editor-callout' role='note'>{moduleName ? text.inheritedNote(moduleName) : text.inheritedFromApplication}</p>}
                    <p className='studio-editor-properties__hint' data-navigation-hierarchy={hierarchy.join(' › ')}><strong>{text.hierarchy}</strong>{' '}{hierarchy.join(' › ')}</p>
                    {item.problems?.map(problem => <p key={problem.code} className='studio-editor-chip studio-editor-chip--error' role='alert'>{text.problems[problem.code] ?? problem.message}</p>)}
                    {[
                        field('label', text.label, PropertyValueType.String, 'text', item.label, own, text.inheritedFromApplication),
                        field('target', text.navigateTo, PropertyValueType.String, 'navigationItemTarget', item.values.target, own, text.inheritedFromApplication),
                        field('slot', text.renderIntoSlot, PropertyValueType.String, 'renderingSlot', item.values.slot, own, text.inheritedFromApplication),
                        field('icon', text.icon, PropertyValueType.String, 'icon', item.values.icon, own, text.inheritedFromApplication),
                    ].map(property => (
                        <PropertyEditorHost key={`${item.id}-${property.descriptor.path}`} registry={registry} property={property} context={context} componentId={item.id} onChange={edit} diagnostics={[]} />
                    ))}
                </>
            ) : (
                <>
                    <header className='studio-editor-properties__header'><strong>{text.modeTitle(regionName, scopeName)}</strong></header>
                    <p className='studio-editor-properties__hint'>{source.regionTag?.long}</p>
                    {navigationModule !== undefined && (
                        <>
                            <p className='studio-editor-properties__hint'>{text.modeDescription(regionName)}</p>
                            <div className='studio-editor-mode-cards' role='radiogroup' aria-label={text.modeTitle(regionName, scopeName)}>
                                {modes.map(candidate => (
                                    <button
                                        key={candidate} type='button' role='radio' aria-checked={candidate === mode} data-mode={candidate}
                                        className={`studio-editor-mode-card${candidate === mode ? ' studio-editor-mode-card--chosen' : ''}`} onClick={() => choose(candidate)}>
                                        <strong>{text.modes[candidate].title}</strong>
                                        <span>{text.modes[candidate].description}</span>
                                    </button>
                                ))}
                            </div>
                            {asking && (
                                <div className='studio-editor-mode__prompt' role='alertdialog' aria-label={text.copyPrompt}>
                                    <span>{text.copyPrompt}</span>
                                    <button type='button' autoFocus data-answer='copy' onClick={() => { setAsking(false); switchTo('override', true); }}>{text.copyYes}</button>
                                    <button type='button' data-answer='empty' onClick={() => { setAsking(false); switchTo('override'); }}>{text.copyNo}</button>
                                </div>
                            )}
                        </>
                    )}
                    {region === 'topbar' && (
                        <fieldset className='studio-editor-logo' data-locked={navigationModule !== undefined || undefined}>
                            <legend>{text.logo}</legend>
                            <label>{text.logoTitle}<input type='text' value={logo?.title ?? ''} disabled={navigationModule !== undefined} onChange={event => logoEdit({ title: event.target.value })} /></label>
                            <label>{text.logoImage}<input type='text' value={logo?.image ?? ''} disabled={navigationModule !== undefined} onChange={event => logoEdit({ image: event.target.value })} /></label>
                            {navigationModule !== undefined && <p className='studio-editor-properties__hint'>{text.logoLocked}</p>}
                        </fieldset>
                    )}
                </>
            )}
        </section>
    );
};
