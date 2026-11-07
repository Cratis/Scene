// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { navigationOutletLevels } from '../navigation/navigationOutlets';
import { OutletChain } from './OutletChain';
import { OutletChainSource } from './OutletChainSource';
import { OutletLevel } from './OutletLevel';
import { OutletLevelKind } from './OutletLevelKind';

/**
 * Builds the chain of outlet levels a screen's outlets resolve through, so no host assembles it itself. The chain is, from
 * the top down: the application level of the navigation model, the screen's layout, its screen template, a level for each
 * module and feature of the screen's `path` (the first a module, the rest features; a module's navigation refinements and
 * contributions and the host's level of that name join it), and the screen with its outlet contributions. Every other
 * screen's outlet contributions, every other module's navigation contributions and every host level not on the path
 * contribute. Pass the result to `effectiveOutlet(chain, outlet, contributors)`.
 * The C# engine's `OutletChains.Of` builds the same chain; both are asserted against `outlet-resolution-fixtures.json`.
 * @param source The document, navigation model and host levels to build from.
 * @param screen The name of the screen.
 * @returns The chain and its contributors; both empty when there is no such screen.
 */
export function outletChainOf(source: OutletChainSource, screen: string): OutletChain {
    const target = (source.screens ?? []).find(candidate => candidate.name === screen);
    if (target === undefined) return { chain: [], contributors: [] };

    const chain: OutletLevel[] = [];
    if (source.navigation !== undefined) chain.push(navigationOutletLevels(source.navigation)[0]);

    const layout = (source.layouts ?? []).find(candidate => candidate.name === target.layout);
    if (layout !== undefined) chain.push(withOutlets({ kind: OutletLevelKind.Layout, name: layout.name }, layout.outlets));

    const template = target.screenTemplate === undefined ? undefined : (source.screenTemplates ?? []).find(candidate => candidate.name === target.screenTemplate);
    if (template !== undefined) chain.push(withOutlets({ kind: OutletLevelKind.Template, name: template.name }, template.outlets));

    const path = target.path ?? [];
    path.forEach((name, index) => {
        const kind = index === 0 ? OutletLevelKind.Module : OutletLevelKind.Feature;
        const module = index === 0 ? source.navigation?.modules.find(candidate => candidate.module === name) : undefined;
        const host = (source.levels ?? []).filter(candidate => candidate.name === name);
        chain.push(merged(kind, name, [
            ...(module === undefined ? [] : [{ kind, name, refinements: module.refinements, contributions: module.contributions }]),
            ...host,
        ]));
    });

    chain.push(withContributions({ kind: OutletLevelKind.Screen, name: target.name }, target.outletContributions));

    const contributors: OutletLevel[] = [
        ...(source.screens ?? [])
            .filter(candidate => candidate !== target && (candidate.outletContributions ?? []).length > 0)
            .map(candidate => withContributions({ kind: OutletLevelKind.Screen, name: candidate.name }, candidate.outletContributions)),
        ...(source.navigation?.modules ?? [])
            .filter(candidate => candidate.module !== path[0] && (candidate.contributions ?? []).length > 0)
            .map(candidate => withContributions({ kind: OutletLevelKind.Module, name: candidate.module }, candidate.contributions)),
        ...(source.levels ?? []).filter(candidate => !path.includes(candidate.name)),
    ];

    return { chain, contributors };
}

function withOutlets(level: OutletLevel, outlets: OutletLevel['outlets']): OutletLevel {
    return outlets === undefined ? level : { ...level, outlets };
}

function withContributions(level: OutletLevel, contributions: OutletLevel['contributions']): OutletLevel {
    return contributions === undefined ? level : { ...level, contributions };
}

function merged(kind: OutletLevelKind, name: string, parts: OutletLevel[]): OutletLevel {
    const level: OutletLevel = { kind, name };
    const outlets = parts.flatMap(part => part.outlets ?? []);
    const refinements = parts.flatMap(part => part.refinements ?? []);
    const contributions = parts.flatMap(part => part.contributions ?? []);
    if (outlets.length > 0) level.outlets = outlets;
    if (refinements.length > 0) level.refinements = refinements;
    if (contributions.length > 0) level.contributions = contributions;
    return level;
}
