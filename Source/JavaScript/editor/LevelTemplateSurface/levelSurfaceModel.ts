// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Layout, OutletKind, OutletRefinement, QueryCandidate, SceneDocument, SceneElement, ScreenTemplate } from '@cratis/scene.model';
import type { DescriptorCatalog } from '@cratis/scene.engine';
import { LayoutItem } from '../ScreenEditor/Layouts/LayoutItem';
import { createPanel } from '../ScreenEditor/Document/createPanel';
import { createExternalComponent } from '../ScreenEditor/Document/createExternalComponent';
import { createScreenDocument } from '../ScreenEditor/Document/studioScreen';
import type { StateChangeSlice } from '../ScreenEditor/Actions/StateChangeSlice';
import { withLevelOutlets, type LevelRefinements } from '../ScreenEditor/DesignMode/Outlets/levelOutlets';
import { refinementAt, type OutletEditingLevel } from '../ScreenEditor/Outlets/outletDocument';
import { screenOutletsOf, type ScreenOutlets } from '../ScreenEditor/DesignMode/Outlets/screenOutlets';
import type { OutletStrings } from '../ScreenEditor/DesignMode/Outlets/OutletStrings';
import type { DesignModePlan } from '../ScreenEditor/DesignMode/designModeTypes';
import { childrenOfElement } from '../ScreenEditor/Selection/sceneTree';

/** What is needed to resolve the outlets a template exposes, as a module or a feature sees them. */
export interface LevelSurfaceInputs {
    /** The name of the template in effect, in Scene: the identifier for an own template. */
    template: string;

    /** The module and the features above and including the level, outermost first, with what each says about the outlets. The last one is the level being edited. */
    levels: readonly LevelRefinements[];
    catalog: DescriptorCatalog;
    templates: readonly ScreenTemplate[];
    layouts: readonly Layout[];
    queries: readonly QueryCandidate[];

    /** The State Change slices of the level: what a hook can run. */
    slices: readonly StateChangeSlice[];
    screens: readonly { id: string; label: string }[];
    strings: OutletStrings;
    newId?: () => string;
}

/** An outlet the template in effect exposes to the level. */
export interface ExposedOutlet {
    name: string;
    kind: OutletKind;

    /** The level that declares it: the template, or the layout around it. */
    owner: string;
}

export interface LevelSurfaceModel {
    /** The document the outlets resolve through: a screen that fills the template, with the levels the host keeps. */
    document: SceneDocument;
    outlets: ScreenOutlets;

    /** The level being edited, as Scene knows it; nothing when the template is not known to Scene. */
    level: OutletEditingLevel | undefined;

    /** The outlets of the template the level can hook into, in the order the template declares them. The shell's own navigation is edited where the shell is. */
    exposed: readonly ExposedOutlet[];
}

const rootOf = (): SceneElement => createPanel(LayoutItem.Container, 'level-surface-root', 'Root');

/**
 * What a module or a feature sees of the outlets of its template: the outlets the template exposes, and each one with what the levels above add, extend,
 * override and hide - Scene's own resolution, so the preview, the export and Stage agree with what is drawn.
 *
 * @param inputs The template, the levels and what the editors of an item need.
 * @returns The outlets as the level being edited sees them.
 */
export function levelSurfaceModel(inputs: LevelSurfaceInputs): LevelSurfaceModel {
    const document = withLevelOutlets(createScreenDocument(rootOf(), inputs.template), inputs.levels);
    const last = inputs.levels[inputs.levels.length - 1];
    const outlets = screenOutletsOf({
        document,
        catalog: inputs.catalog,
        path: inputs.levels.map(level => level.name),
        templates: inputs.templates,
        layouts: inputs.layouts,
        ...(last ? { requestedLevel: { kind: last.kind, name: last.name } } : {}),
        queries: inputs.queries,
        slices: inputs.slices,
        screens: inputs.screens,
        strings: inputs.strings,
        ...(inputs.newId ? { newId: inputs.newId } : {}),
    });
    const exposed = outlets.declared.filter(outlet => !outlet.shell).map(outlet => ({ name: outlet.name, kind: outlet.kind, owner: outlet.owner }));
    return { document, outlets, level: outlets.level, exposed };
}

/** What a plan leaves the level saying about an outlet: nothing means it goes back to inheriting. */
export function refinementAfter(model: LevelSurfaceModel, plan: DesignModePlan, outlet: string): OutletRefinement | undefined {
    const level = model.level;
    if (!level || !plan.documentChange) return undefined;
    return refinementAt(plan.documentChange(model.document), level, outlet);
}

/** The levels with the refinement of the outlet of the level replaced - or taken away, when the level inherits it again. */
export function levelsWithRefinement(levels: readonly LevelRefinements[], level: OutletEditingLevel, outlet: string, refinement: OutletRefinement | undefined): LevelRefinements[] {
    return levels.map(candidate => {
        if (candidate.kind !== level.kind || candidate.name !== level.name) return { ...candidate };
        const others = candidate.refinements.filter(existing => existing.outlet !== outlet);
        return { ...candidate, refinements: refinement ? [...others, refinement] : others };
    });
}

/** An outlet the template draws somewhere on the preview: the id of the element that draws it, by the name of the outlet. */
export function outletElementsOf(element: SceneElement | undefined): ReadonlyMap<string, string> {
    const found = new Map<string, string>();
    const visit = (node: SceneElement): void => {
        const componentName = (node as unknown as { componentName?: unknown }).componentName;
        const name = (node as unknown as { properties?: Record<string, unknown> }).properties?.name;
        if (typeof componentName === 'string' && /(^|:)outletItems$/.test(componentName) && typeof name === 'string' && name !== '' && !found.has(name)) found.set(name, node.id);
        childrenOfElement(node).forEach(visit);
    };
    if (element) visit(element);
    return found;
}

/** The kind of outlet a template exposes at least one of, or none. */
export const exposesKind = (exposed: readonly ExposedOutlet[], kind: OutletKind): boolean => exposed.some(outlet => outlet.kind === kind);

/** The component a template draws an outlet with. */
export const outletItemsComponent = 'core:outletItems';

/**
 * The outlets a template exposes but does not draw, as a strip of their own: one band for each, in the order the template declares them. A template declares an outlet and the
 * content it puts in its slots decides where it is drawn; one that draws none of its outlets - a package's list page, say - would otherwise leave the level with nowhere to hook
 * into, so the surface gives each a place and says so.
 *
 * @param missing The names of the outlets the template exposes and does not draw, in the order it declares them.
 * @returns The element of the strip, or nothing when every outlet is drawn.
 */
export function undrawnOutletStrip(missing: readonly string[]): SceneElement | undefined {
    if (missing.length === 0) return undefined;
    const bands = missing.map(name => createExternalComponent(`level-outlet-${name}`, name, outletItemsComponent, { name }));
    return createPanel(LayoutItem.Stack, 'level-surface-outlets', 'Outlets', bands);
}
