// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { createBindingScope } from '../Binding/bindingScopeTypes';
import { defaultDesignModeStrings } from '../DesignMode/DesignModeStrings';
import { designModeActions, isRejection, type DesignModeItem, type DesignModePlan, type DesignModeRejection } from '../DesignMode/designModeTypes';
import type { OutletDesign, OutletLevelMode } from '../DesignMode/Outlets/createOutletDesign';
import { bindingActionsOf } from '../DesignMode/Outlets/outletBindings';
import { addActionOf } from '../DesignMode/Outlets/outletDesignModes';
import { useScreenOutlets } from '../DesignMode/Outlets/screenOutlets';
import type { OutletStrings } from '../DesignMode/Outlets/OutletStrings';
import { createEditorContext } from '../PropertyEditors/Registry/createEditorContext';
import { PropertyEditorHost } from '../PropertyEditors/Registry/PropertyEditorHost';
import { screenEditorPropertyEditors } from '../PropertyEditors/Registry/screenEditorPropertyEditors';
import { filtersSettingQuery } from '../Binding/parameterFeeds';
import { localizedDisplay } from './localizedDisplay';
import { slotNames } from './NavigationSection';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import './OutletSection.css';

export interface OutletSectionProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;

    // The outlet shown: the one the selected element draws, or one chosen from the screen's list.
    outlet: string;

    // The element that draws it, when one is selected: its items are selected on the surface too.
    componentId?: string;

    // Shows another of the screen's outlets.
    onChooseOutlet?: (outlet: string) => void;
}

const modes: readonly OutletLevelMode[] = ['inherit', 'extend', 'override'];

// The Properties of an outlet (6d): what it is and who declares it, the level it is edited at, how that level takes it - the Inherit / Extend / Override cards
// navigation editing has, for every kind - its items with where each comes from, the hidden and overridden ones struck through with Bring back, the "+" of its
// kind, the bindings of the selected item, and the other outlets of the screen with each one's mode. Everything shown is what Scene resolves; every change is
// one undo step.
export const OutletSection = ({ controller, environment, strings, outlet, componentId, onChooseOutlet }: OutletSectionProps) => {
    const designStrings = strings.designMode ?? defaultDesignModeStrings;
    const text = designStrings.outlets;
    const screenOutlets = useScreenOutlets(controller, environment, text);
    const [asking, setAsking] = useState(false);
    const [localItem, setLocalItem] = useState<string>();
    const scope = useMemo(() => createBindingScope(environment.availableSources), [environment.availableSources]);
    const design = screenOutlets.design(outlet);
    if (!design || !screenOutlets.level) return null;

    const level = screenOutlets.level;
    const selectedItemId = componentId !== undefined ? controller.selectedItemId : localItem;
    const select = (itemId: string | undefined) => {
        if (componentId !== undefined) controller.selectItem(itemId === undefined ? undefined : componentId, itemId);
        else setLocalItem(itemId);
    };
    const perform = (outcome: DesignModePlan | DesignModeRejection | undefined) => {
        if (!outcome || isRejection(outcome) || !outcome.documentChange) return;
        if (!controller.changeDocument(outcome.documentChange, outcome.label).applied) return;
        if (outcome.select?.itemId !== undefined) select(outcome.select.itemId ?? undefined);
    };

    const levelLabel = (candidate: { kind: string; name: string }) => text.levelName(text.levels[candidate.kind] ?? candidate.kind, candidate.name);
    // Who the level inherits from: every level the items come from above it, as Scene's sources name them ("ListPage + Catalog").
    const owner = design.effective.sources.filter(source => source !== level.name).join(' + ') || (design.declaredBy ?? '');
    const choose = (next: OutletLevelMode) => {
        if (next === design.mode) return;
        if (next === 'override' && design.items.some(item => item.readOnly && item.provenance?.source !== 'contribution')) { setAsking(true); return; }
        setAsking(false);
        perform(design.setMode(next));
    };

    const item = selectedItemId ? design.items.find(candidate => candidate.id === selectedItemId) : undefined;
    const registry = environment.propertyEditors?.registry ?? screenEditorPropertyEditors;
    const context = createEditorContext({ controller, environment, strings, ownership: undefined, diagnostics: [], inCanvas: false, bindingScope: scope, slotNames: slotNames(designStrings.navigation) });
    const others = screenOutlets.declared.filter(candidate => candidate.name !== outlet && candidate.kind !== undefined && !candidate.shell);
    const addItem = addActionOf[design.outletKind];
    const provenanceOf = (candidate: DesignModeItem): string => {
        if (!candidate.readOnly) return text.own;
        return candidate.provenance?.source === 'contribution' ? text.contributedBy(candidate.provenance.owner) : text.fromLevel(candidate.provenance?.owner ?? owner);
    };

    return (
        <section className='studio-editor-outlet' data-section='outlet' data-outlet={design.name} data-outlet-kind={design.outletKind} data-mode={design.mode}>
            <header className='studio-editor-properties__header'>
                <strong>{text.title(design.name, text.kinds[design.outletKind] ?? design.outletKind)}</strong>
                <span className='studio-editor-chip' data-outlet-tag>{design.effective.summary}</span>
            </header>
            <p className='studio-editor-properties__hint'>
                {text.declaredBy(design.declaredBy ?? owner)}{' '}
                <label className='studio-editor-outlet__level'>
                    <span>{text.editingAs}</span>
                    <select value={`${level.kind}:${level.name}`} onChange={event => {
                        const chosen = screenOutlets.levels.find(candidate => `${candidate.kind}:${candidate.name}` === event.target.value);
                        controller.setOutletLevel(chosen);
                        setAsking(false);
                    }}>
                        {screenOutlets.levels.map(candidate => <option key={`${candidate.kind}:${candidate.name}`} value={`${candidate.kind}:${candidate.name}`}>{levelLabel(candidate)}</option>)}
                    </select>
                </label>
                {level.kind !== 'screen' && <>{' '}{text.everyScreenBelow(level.name)}</>}
            </p>

            <div className='studio-editor-mode-cards' role='radiogroup' aria-label={text.modeTitle}>
                {modes.map(candidate => (
                    <button
                        key={candidate} type='button' role='radio' aria-checked={candidate === design.mode} data-mode={candidate}
                        className={`studio-editor-mode-card${candidate === design.mode ? ' studio-editor-mode-card--chosen' : ''}`} onClick={() => choose(candidate)}>
                        <strong>{text.modes[candidate].title}</strong>
                        <span>{text.modes[candidate].description(owner)}</span>
                    </button>
                ))}
            </div>
            {asking && (
                <div className='studio-editor-mode__prompt' role='alertdialog' aria-label={text.copyPrompt}>
                    <span>{text.copyPrompt}</span>
                    <button type='button' autoFocus data-answer='copy' onClick={() => { setAsking(false); perform(design.setMode('override', true)); }}>{text.copyYes}</button>
                    <button type='button' data-answer='empty' onClick={() => { setAsking(false); perform(design.setMode('override')); }}>{text.copyNo}</button>
                </div>
            )}

            <div className='studio-editor-outlet__items-header'>
                <strong>{text.items}</strong>
                <button type='button' data-add={addItem.id} onClick={() => perform(design.add(addItem.id))}>{text.add(text.newItem[addItem.item] ?? addItem.item)}</button>
            </div>
            <ul className='studio-editor-outlet__items' aria-label={text.items}>
                {design.items.length === 0 && design.removed.length === 0 && <li className='studio-editor-properties__hint'>{text.nothingYet}</li>}
                {design.items.filter(candidate => candidate.parentId === undefined).map(candidate => (
                    <li key={candidate.id} data-item={candidate.id} data-source={candidate.provenance?.source} data-selected={candidate.id === selectedItemId || undefined}>
                        <button type='button' className='studio-editor-outlet__item' aria-pressed={candidate.id === selectedItemId} onClick={() => select(candidate.id)}>
                            <span>{candidate.label || candidate.id}</span>
                            <small>{provenanceOf(candidate)}</small>
                        </button>
                        {candidate.readOnly && <button type='button' data-action='hide' onClick={() => perform(design.hide(candidate))}>{text.hide}</button>}
                    </li>
                ))}
                {design.removed.map(candidate => (
                    <li key={`removed-${candidate.id}`} data-item={candidate.id} data-removal={candidate.removal}>
                        <s>{candidate.label || candidate.id}</s>
                        <small>{candidate.removal === 'hidden' ? text.hiddenHere : text.overriddenHere}</small>
                        <button type='button' data-action='bringBack' onClick={() => perform(design.bringBack(candidate))}>{text.bringBack}</button>
                    </li>
                ))}
            </ul>
            {design.items.some(candidate => candidate.provenance?.source === 'contribution') && <p className='studio-editor-properties__hint'>{text.contributionNote}</p>}

            {item && <OutletItemFields design={design} item={item} text={text} designStrings={designStrings} registry={registry} context={context} componentId={componentId ?? design.name} noQueries={screenOutlets.binding.queries.length === 0} perform={perform} />}
            {item && String(item.values.kind) === 'stat' && <StatFollowsFilters item={item} filters={screenOutlets.declared.filter(declared => declared.kind === 'filters' && !declared.shell).flatMap(declared => (screenOutlets.design(declared.name)?.items ?? []).map(filter => ({ outlet: declared.name, item: { id: filter.id, label: filter.label, values: filter.values as Record<string, unknown> } })))} text={strings.properties.dataBinding} />}

            {others.length > 0 && (
                <section className='studio-editor-outlet__others' aria-label={text.otherOutlets}>
                    <strong>{text.otherOutlets}</strong>
                    <ul>
                        {others.map(other => {
                            const otherDesign = screenOutlets.design(other.name);
                            const own = otherDesign ? otherDesign.items.filter(candidate => !candidate.readOnly && candidate.parentId === undefined).length : 0;
                            const otherMode = otherDesign?.mode ?? 'inherit';
                            return (
                                <li key={other.name} data-other-outlet={other.name}>
                                    <button type='button' onClick={() => onChooseOutlet?.(other.name)} disabled={!onChooseOutlet}>
                                        <span>{other.name}</span>
                                        <small>{text.kinds[other.kind] ?? other.kind}</small>
                                        <small data-other-mode={otherMode}>{text.modeOf[otherMode]}{own > 0 ? ` · ${text.added(own)}` : ''}</small>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </section>
    );
};

interface OutletItemFieldsProps {
    design: OutletDesign;
    item: DesignModeItem;
    text: OutletStrings;
    designStrings: NonNullable<ScreenEditorStrings['designMode']>;
    registry: typeof screenEditorPropertyEditors;
    context: ReturnType<typeof createEditorContext>;
    componentId: string;
    noQueries: boolean;
    perform: (outcome: DesignModePlan | DesignModeRejection | undefined) => void;
}

// The selected item's title and what it binds to, drawn by the editors the floating toolbar's chips draw them with. An item this level does not own says
// where it comes from instead.
const OutletItemFields = ({ design, item, text, designStrings, registry, context, componentId, noQueries, perform }: OutletItemFieldsProps) => {
    if (item.readOnly) return <p className='studio-editor-callout' role='note'>{designStrings.inheritedFrom(item.provenance?.owner ?? item.origin ?? '')}</p>;
    const kind = String(item.values.kind ?? '');
    const bindings = bindingActionsOf(kind).flatMap(actionId => {
        const choice = design.choice(actionId, item);
        return choice ? [{ actionId, choice }] : [];
    });
    return (
        <section className='studio-editor-outlet__item-fields' data-section='outletItem' data-item={item.id}>
            <label>
                <span>{text.bindings.title}</span>
                <input key={`${item.id}-${item.label}`} defaultValue={item.label} onBlur={event => { if (event.target.value !== '' && event.target.value !== item.label) perform(design.rename(item, event.target.value)); }} />
            </label>
            {noQueries && (design.outletKind === 'filters' || design.outletKind === 'stats') && <p className='studio-editor-properties__hint'>{text.bindings.noQuery}</p>}
            {bindings.map(({ actionId, choice }) => (
                <div key={`${item.id}-${actionId}`} data-binding={actionId}>
                    <PropertyEditorHost
                        registry={registry}
                        property={actionId === designModeActions.display ? localizedDisplay(choice.property, designStrings.toolbar) : choice.property}
                        context={context}
                        componentId={componentId}
                        onChange={(_, value) => perform(choice.plan(value))}
                        diagnostics={[]}
                    />
                </div>
            ))}
        </section>
    );
};

interface StatFollowsFiltersProps {
    item: DesignModeItem;
    filters: readonly { outlet: string; item: { id: string; label: string; values: Record<string, unknown> } }[];
    text: ScreenEditorStrings['properties']['dataBinding'];
}

// Whether a stat follows the filters of the screen: it shows a field of a single-result query, and the filters that set a parameter of that query are what it follows.
const StatFollowsFilters = ({ item, filters, text }: StatFollowsFiltersProps) => {
    const valueFrom = item.values.valueFrom as { query?: string } | undefined;
    if (!valueFrom?.query) return null;
    const following = filtersSettingQuery(filters.map(filter => filter.item), valueFrom.query);
    return (
        <p className='studio-editor-properties__hint' role='status' data-stat-follows={following.length}>
            {following.length > 0 ? text.statFollowsFilters(following.map(filter => filter.label).join(', ')) : text.statFollowsNothing}
        </p>
    );
};
