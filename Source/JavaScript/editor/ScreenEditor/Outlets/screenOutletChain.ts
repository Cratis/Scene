// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DialogTemplate, Layout, SceneDocument, ScreenTemplate } from '@cratis/scene.model';
import { OutletLevelKind, dialogTemplateOutlets, outletChainOf, type OutletChain, type OutletLevel } from '@cratis/scene.engine';
import { navigationOf } from '../DesignMode/Navigation/navigationDocument';
import { outletLevelsOf, sameLevel, type OutletEditingLevel } from './outletDocument';

export interface ScreenOutletChainInputs {
    document: SceneDocument;
    screen: string;

    // Where the screen sits - its module, then its features - when the document's screen does not say so itself.
    path?: readonly string[];

    // The templates and layouts the document refers to but does not carry: those of the packages and the application's own.
    templates?: readonly ScreenTemplate[];
    layouts?: readonly Layout[];

    // The dialog or drawer template the screen opens in, when the screen is one (StudioIssues#1329): it declares the `actions` outlet - Cancel and Submit - the
    // screen then refines, as it refines the outlets of a screen template.
    dialogTemplate?: DialogTemplate;
}

const byName = <T extends { name: string }>(own: readonly T[], known: readonly T[] | undefined): T[] =>
    [...own, ...(known ?? []).filter(candidate => !own.some(ownCandidate => ownCandidate.name === candidate.name))];

// The levels the outlets of the screen resolve through, from the top down, and the levels outside them that contribute - as Scene's `outletChainOf` builds
// them. Studio only supplies what the document does not carry, and adds the screen's own refinements to the screen's level: Scene's screen carries
// contributions only, so a screen that extends, overrides or hides is a level Studio keeps.
export function screenOutletChain({ document, screen, path, templates, layouts, dialogTemplate }: ScreenOutletChainInputs): OutletChain {
    const levels = outletLevelsOf(document);
    const own = levels.find(level => level.kind === OutletLevelKind.Screen && level.name === screen);
    const screens = document.screens.map(candidate => candidate.name === screen && !candidate.path && path && path.length > 0 ? { ...candidate, path: [...path] } : candidate);
    const { chain: resolved, contributors } = outletChainOf({
        layouts: byName(document.layouts, layouts),
        screenTemplates: byName(document.screenTemplates, templates),
        screens,
        navigation: navigationOf(document),
        levels: levels.filter(level => level.kind !== OutletLevelKind.Screen),
    }, screen);
    const chain = dialogTemplate ? withDialogTemplate(resolved, dialogTemplate) : resolved;
    if (chain.length === 0 || !own?.refinements) return { chain, contributors };

    const last = chain[chain.length - 1];
    return { chain: [...chain.slice(0, -1), { ...last, refinements: [...(last.refinements ?? []), ...own.refinements] }], contributors };
}

// The dialog template is a level that declares outlets, below the layout and the screen template the screen sits in and above the module, features and
// screen that refine them. It declares nothing a level above it already does: the template's own `actions` outlet, if it has one, wins.
function withDialogTemplate(chain: readonly OutletLevel[], dialogTemplate: DialogTemplate): OutletLevel[] {
    const declaredAbove = new Set(chain.flatMap(level => (level.outlets ?? []).map(outlet => outlet.name)));
    const outlets = dialogTemplateOutlets(dialogTemplate).filter(outlet => !declaredAbove.has(outlet.name));
    if (outlets.length === 0) return [...chain];
    const refining = chain.findIndex(level => level.kind === OutletLevelKind.Module || level.kind === OutletLevelKind.Feature || level.kind === OutletLevelKind.Slice || level.kind === OutletLevelKind.Screen);
    const at = refining < 0 ? chain.length : refining;
    return [...chain.slice(0, at), { kind: OutletLevelKind.Template, name: dialogTemplate.name, outlets }, ...chain.slice(at)];
}

// The levels an outlet of the screen can be edited at, from the top down: the module and the features the screen sits in, and the screen itself.
export const editingLevelsOf = (chain: readonly OutletLevel[]): OutletEditingLevel[] =>
    chain
        .filter(level => level.kind === OutletLevelKind.Module || level.kind === OutletLevelKind.Feature || level.kind === OutletLevelKind.Slice || level.kind === OutletLevelKind.Screen)
        .map(level => ({ kind: level.kind, name: level.name }));

// The chain as it ends at the level being edited - what that level sees and every screen below it gets - with the contributions of the levels below it
// still counted, as the contributions of the screens around it are.
export function chainAt(outlets: OutletChain, level: OutletEditingLevel | undefined): OutletChain {
    if (!level) return outlets;
    const index = findLastIndex(outlets.chain, candidate => sameLevel(candidate, level));
    if (index < 0 || index === outlets.chain.length - 1) return outlets;
    const below = outlets.chain.slice(index + 1).filter(candidate => (candidate.contributions ?? []).length > 0).map(candidate => ({ kind: candidate.kind, name: candidate.name, contributions: candidate.contributions }));
    return { chain: outlets.chain.slice(0, index + 1), contributors: [...outlets.contributors, ...below] };
}

function findLastIndex<T>(items: readonly T[], predicate: (item: T) => boolean): number {
    for (let index = items.length - 1; index >= 0; index--) if (predicate(items[index])) return index;
    return -1;
}

// The outlets the screen's levels declare, by name and in order - what "Other outlets on this screen" lists.
export const declaredOutletsOf = (chain: readonly OutletLevel[]) => chain.flatMap(level => (level.outlets ?? []).map(outlet => ({ outlet, level })));
