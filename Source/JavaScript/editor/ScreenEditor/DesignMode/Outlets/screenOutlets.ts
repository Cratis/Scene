// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { EditingScopeKind, type DialogTemplate, type Layout, type OutletKind, PropertyDescriptor, QueryCandidate, SceneDocument, ScreenTemplate } from '@cratis/scene.model';
import { OutletLevelKind, applicationNavigationLevel, findComponentDescriptor, outletItemsComponentName, type DescriptorCatalog, type OutletChain } from '@cratis/scene.engine';
import { screenName } from '../../Document/studioScreen';
import type { ScreenEditorController } from '../../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../../Host/ScreenEditorHost';
import { nextElementId } from '../../Host/nextElementId';
import { dialogTemplateOf, showsDialogActions } from '../../Templates/dialogActionsChrome';
import { blueprintDialogTemplatesOf } from '../../Templates/displayedFits';
import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import { placementEnvironmentOf } from '../../Placement/placementEnvironment';
import { createOutletDesign, type OutletDesign } from './createOutletDesign';
import type { OutletBindingContext } from './outletBindings';
import { sameLevel, type OutletEditingLevel } from '../../Outlets/outletDocument';
import type { OutletStrings } from './OutletStrings';
import { declaredOutletsOf, editingLevelsOf, screenOutletChain } from '../../Outlets/screenOutletChain';

// The outlets of the screen being edited: the levels they resolve through, the levels they can be edited at, the level being edited, and each outlet as
// that level sees it - shared by the surface's chrome, its frames and the inspector, so all three say the same.
export interface ScreenOutlets {
    outlets: OutletChain;
    levels: readonly OutletEditingLevel[];
    level: OutletEditingLevel | undefined;
    // The outlets the screen's levels declare, with who declares each; `shell` for the application's own navigation regions, edited where the shell is.
    declared: readonly { name: string; kind: OutletKind; owner: string; shell: boolean }[];
    binding: OutletBindingContext;
    design: (outlet: string) => OutletDesign | undefined;
}

export interface ScreenOutletsInputs {
    document: SceneDocument;
    catalog: DescriptorCatalog;
    path?: readonly string[];
    templates?: readonly ScreenTemplate[];
    layouts?: readonly Layout[];
    dialogTemplate?: DialogTemplate;
    requestedLevel?: OutletEditingLevel;
    queries: readonly QueryCandidate[];
    // The State Change slices a hook can run; without them a hook's chips say only what it stores (StudioIssues#1331).
    slices?: readonly StateChangeSlice[];
    screens: readonly { id: string; label: string }[];
    structure?: OutletBindingContext['structure'];
    strings: OutletStrings;
    newId?: () => string;
}

// The ids and names of the queries the screen binds anything to - what its filters set and its stats show. A screen that binds none yet offers every query.
export function queriesOfScreen(document: SceneDocument, candidates: readonly QueryCandidate[]): QueryCandidate[] {
    const named = new Set<string>();
    const visit = (value: unknown): void => {
        if (Array.isArray(value)) { value.forEach(visit); return; }
        if (typeof value !== 'object' || value === null) return;
        const record = value as Record<string, unknown>;
        if (typeof record.queryId === 'string') named.add(record.queryId);
        if (typeof record.queryId === 'string' && typeof record.query === 'string') named.add(record.query);
        Object.values(record).forEach(visit);
    };
    visit(document.screens.find(screen => screen.name === screenName));
    const bound = candidates.filter(candidate => named.has(candidate.id) || named.has(candidate.name));
    return bound.length > 0 ? bound : [...candidates];
}

// Scene's descriptors of an action's properties, from the component that draws an outlet.
export function actionPropertiesOf(catalog: DescriptorCatalog): PropertyDescriptor[] {
    const descriptor = findComponentDescriptor(catalog, outletItemsComponentName);
    return descriptor?.properties.find(property => property.path === 'items')?.item?.properties ?? [];
}

export function screenOutletsOf(inputs: ScreenOutletsInputs): ScreenOutlets {
    const { document, catalog, strings } = inputs;
    const outlets = screenOutletChain({ document, screen: screenName, ...(inputs.path ? { path: inputs.path } : {}), ...(inputs.templates ? { templates: inputs.templates } : {}), ...(inputs.layouts ? { layouts: inputs.layouts } : {}), ...(inputs.dialogTemplate ? { dialogTemplate: inputs.dialogTemplate } : {}) });
    const levels = editingLevelsOf(outlets.chain);
    const screenLevel = levels.find(candidate => candidate.kind === OutletLevelKind.Screen);
    const level = levels.find(candidate => sameLevel(candidate, inputs.requestedLevel)) ?? screenLevel;
    const binding: OutletBindingContext = {
        queries: queriesOfScreen(document, inputs.queries),
        screens: inputs.screens,
        actionProperties: actionPropertiesOf(catalog),
        ...(inputs.slices ? { placement: placementEnvironmentOf({ document, screen: screenName, slices: inputs.slices, queries: inputs.queries, ...(inputs.templates ? { templates: inputs.templates } : {}), ...(inputs.layouts ? { layouts: inputs.layouts } : {}) }) } : {}),
        ...(inputs.structure ? { structure: inputs.structure } : {}),
        strings: strings.bindings,
    };
    const declared = declaredOutletsOf(outlets.chain).map(({ outlet, level: owner }) => ({
        name: outlet.name, kind: outlet.kind, owner: owner.name, shell: owner.kind === OutletLevelKind.Layout && owner.name === applicationNavigationLevel,
    }));
    const newId = inputs.newId ?? nextElementId;
    return {
        outlets,
        levels,
        level,
        declared,
        binding,
        design: outlet => level ? createOutletDesign({ document, outlets, outlet, level, newId, binding, strings }) : undefined,
    };
}

export function useScreenOutlets(controller: ScreenEditorController, environment: ScreenEditorEnvironment, strings: OutletStrings): ScreenOutlets {
    const { document, context, outletLevel, structure } = controller;
    const path = environment.location?.path;
    const templates = useMemo(() => [...(environment.ownTemplates ?? []), ...environment.runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? [])], [environment.ownTemplates, environment.runtime.bundles]);
    const layouts = useMemo(() => environment.runtime.bundles.flatMap(bundle => bundle.layouts ?? []), [environment.runtime.bundles]);
    const screens = useMemo(() => environment.destinations.map(destination => ({ id: destination.id, label: destination.label })), [environment.destinations]);
    const editingScreen = context.scope.kind === EditingScopeKind.Screen;
    const dialogTemplate = useMemo(
        () => editingScreen && showsDialogActions(document, templates, layouts, controller.opensOverPage, blueprintDialogTemplatesOf(environment.runtime.bundles)) ? dialogTemplateOf(document, blueprintDialogTemplatesOf(environment.runtime.bundles)) : undefined,
        [document, editingScreen, templates, layouts, environment.runtime.bundles, controller.opensOverPage]);
    return useMemo(() => screenOutletsOf({
        document, catalog: context.catalog, templates, layouts, ...(dialogTemplate ? { dialogTemplate } : {}), queries: environment.queryCandidates, slices: environment.stateChangeSlices, screens, strings,
        ...(path ? { path } : {}),
        ...(outletLevel ? { requestedLevel: outletLevel } : {}),
        ...(structure.modules.length > 0 ? { structure } : {}),
    }), [document, context.catalog, templates, layouts, environment.queryCandidates, environment.stateChangeSlices, screens, strings, path, outletLevel, structure, dialogTemplate]);
}
