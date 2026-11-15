// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { OutletKind, type Layout, type QueryBinding, type QueryCandidate, type QueryParameter, type SceneDocument, type ScreenTemplate } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { nextElementId } from '../Host/nextElementId';
import { defaultDesignModeStrings } from '../DesignMode/DesignModeStrings';
import { isRejection } from '../DesignMode/designModeTypes';
import { useScreenOutlets } from '../DesignMode/Outlets/screenOutlets';
import { sourceOf } from '../Binding/queryBindingModel';
import { filterFor, filtersSetting, mappedRouteOf, withRouteSource, type ListedItem, type RoutedValue } from '../Binding/parameterFeeds';
import { detailShowsOf, hasRoutedSlot, routedSlotsOf, screenplayNameOf, withDetailShow } from '../Binding/detailShows';
import { queryTableOf } from '../Data/queryTables';
import { findSceneElement } from '../Selection/sceneTree';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

const templatesOf = (environment: ScreenEditorEnvironment, document: SceneDocument): ScreenTemplate[] => [...document.screenTemplates, ...(environment.ownTemplates ?? []), ...environment.runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? [])];
const layoutsOf = (environment: ScreenEditorEnvironment, document: SceneDocument): Layout[] => [...document.layouts, ...environment.runtime.bundles.flatMap(bundle => bundle.layouts ?? [])];

interface FeedsProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    binding: QueryBinding;
    candidate: QueryCandidate;
    disabled?: boolean;

    // Called with the binding once a route value is picked for a parameter - or taken off, when the path is empty.
    onChange?: (binding: QueryBinding, parameter: QueryParameter, path: string) => void;
}

// What feeds each parameter of the query a table or a stat is bound to: the filters of the screen that set it, the route values of a routed slot, or an argument
// mapped by hand - and for a parameter nothing feeds, a way to add the filter that would. All of it is what Scene resolves; this only says it.
export const ParameterFeedsSection = ({ controller, environment, strings, binding, candidate, disabled, onChange }: FeedsProps) => {
    const text = strings.properties.dataBinding;
    const designStrings = strings.designMode ?? defaultDesignModeStrings;
    const screenOutlets = useScreenOutlets(controller, environment, designStrings.outlets);
    const templates = useMemo(() => templatesOf(environment, controller.document), [environment, controller.document]);
    const layouts = useMemo(() => layoutsOf(environment, controller.document), [environment, controller.document]);
    const routed = useMemo(() => routedSlotsOf(controller.document, templates, layouts), [controller.document, templates, layouts]);
    const routeValues: RoutedValue[] = routed.flatMap(slot => slot.routedBy.map(parameter => ({ slot: slot.name, parameter, path: `route.${parameter}` })));
    const filterOutlets = screenOutlets.declared.filter(declared => declared.kind === OutletKind.Filters && !declared.shell);
    if (candidate.parameters.length === 0) return null;

    const listed = filterOutlets.flatMap(declared => (screenOutlets.design(declared.name)?.items ?? []).map(item => ({ outlet: declared.name, item: { id: item.id, label: item.label, values: item.values as Record<string, unknown> } satisfies ListedItem })));
    const addFilter = (parameter: string) => {
        const outlet = filterOutlets[0] && screenOutlets.design(filterOutlets[0].name);
        if (!outlet) return;
        const plan = outlet.addItem(filterFor(candidate.name, parameter, nextElementId()));
        if (!isRejection(plan) && plan.documentChange) controller.changeDocument(plan.documentChange, plan.label);
    };

    return (
        <div className='studio-editor-query__group' data-parameter-feeds={candidate.name}>
            <strong>{text.feedsTitle}</strong>
            <ul className='studio-editor-query__feeds'>
                {candidate.parameters.map(parameter => {
                    const filters = listed.flatMap(entry => filtersSetting(entry.outlet, [entry.item], candidate.name, parameter.name));
                    const routes = routed.filter(slot => slot.routedBy.includes(parameter.name));
                    const mapped = sourceOf(binding, parameter);
                    const fed = filters.length > 0 || routes.length > 0 || mapped !== '';
                    return (
                        <li key={parameter.name} data-fed={fed}>
                            <span>{parameter.name}</span>
                            {filters.map(filter => <span key={filter.id} className='studio-editor-properties__chip' data-feed='filter'>{text.fedByFilter(filter.title)}</span>)}
                            {routes.map(slot => <span key={slot.name} className='studio-editor-properties__chip' data-feed='route'>{text.fedByRoute(parameter.name, slot.name)}</span>)}
                            {mapped !== '' && <span className='studio-editor-properties__chip' data-feed='mapping'>{text.fedByMapping(mapped)}</span>}
                            {!fed && <span className='studio-editor-properties__chip' data-feed='none'>{text.fedByNothing}</span>}
                            {!fed && filterOutlets.length > 0 && <button type='button' onClick={() => addFilter(parameter.name)}>{text.addFilter}</button>}
                            {onChange && routeValues.length > 0 && (
                                <select
                                    aria-label={text.routeSource(parameter.name)} data-route-source={parameter.name} disabled={disabled}
                                    value={mappedRouteOf(binding, parameter.name, routeValues)?.path ?? ''}
                                    onChange={event => onChange(withRouteSource(binding, parameter.name, routeValues.find(value => value.path === event.target.value)), parameter, event.target.value)}>
                                    <option value=''>{text.routeSourceNone}</option>
                                    {routeValues.map(value => <option key={`${value.slot}.${value.parameter}`} value={value.path}>{text.routeSourceOption(value.parameter, value.slot)}</option>)}
                                </select>
                            )}
                        </li>
                    );
                })}
            </ul>
            {listed.length > 0 && hasRoutedSlot(controller.document, templates, layouts) && <p className='studio-editor-properties__hint'>{text.filtersInAddress}</p>}
        </div>
    );
};

interface SelectionProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    elementId: string;
    disabled: boolean;
}

// What selecting a row of a table does: a routed slot of the page shows another screen - another slice's - for the selected row (`show <Screen> by <value> from
// <table>.selection`). The slot's route values decide what the screen is shown by.
export const SelectionDetailSection = ({ controller, environment, strings, elementId, disabled }: SelectionProps) => {
    const text = strings.properties.dataBinding;
    const templates = useMemo(() => templatesOf(environment, controller.document), [environment, controller.document]);
    const layouts = useMemo(() => layoutsOf(environment, controller.document), [environment, controller.document]);
    const slots = useMemo(() => routedSlotsOf(controller.document, templates, layouts), [controller.document, templates, layouts]);
    const element = findSceneElement(controller.composition.roots, elementId);
    const table = element ? queryTableOf(element) : undefined;
    if (!table) return null;

    const name = screenplayNameOf(elementId);
    const shows = detailShowsOf(controller.document).filter(show => show.element === name);
    const current = shows[0];
    const change = (slot: string, screen: string, by: string) =>
        controller.changeDocument(document => {
            const cleared = current && current.slot !== slot ? withDetailShow(document, current.slot, undefined) : document;
            return withDetailShow(cleared, slot, screen === '' ? undefined : { screen, by, element: name });
        }, text.selectionTitle);

    return (
        <fieldset className='studio-editor-query' disabled={disabled} data-selection-detail={elementId}>
            <legend>{text.selectionTitle}</legend>
            {slots.length === 0 && <p className='studio-editor-properties__hint'>{text.selectionNoSlot}</p>}
            {slots.length > 0 && (
                <>
                    <p className='studio-editor-properties__hint'>{text.selectionHint}</p>
                    <label>
                        <span>{text.selectionSlot}</span>
                        <select value={current?.slot ?? slots[0].name} onChange={event => current && change(event.target.value, current.screen, slots.find(slot => slot.name === event.target.value)?.routedBy[0] ?? current.by)}>
                            {slots.map(slot => <option key={slot.name} value={slot.name}>{slot.name} ({slot.routedBy.join(', ')})</option>)}
                        </select>
                    </label>
                    <label>
                        <span>{text.selectionScreen}</span>
                        <select value={current?.screen ?? ''} onChange={event => {
                            const slot = slots.find(candidate => candidate.name === (current?.slot ?? slots[0].name)) ?? slots[0];
                            change(slot.name, event.target.value, slot.routedBy[0]);
                        }}>
                            <option value=''>{text.selectionNone}</option>
                            {environment.destinations.map(destination => <option key={destination.id} value={destination.label}>{destination.label}</option>)}
                        </select>
                    </label>
                    {current && <p className='studio-editor-query__preview' role='status'>{text.selectionSummary(current.screen, current.slot, current.by)}</p>}
                </>
            )}
        </fieldset>
    );
};
