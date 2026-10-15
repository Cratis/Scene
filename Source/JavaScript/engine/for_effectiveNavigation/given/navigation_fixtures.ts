// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import {
    ApplicationStructureIndex, EffectiveNavItem, NavigationDiagnostic, NavigationEdit, NavigationEditPlan,
    addNavItem, effectiveNavigation, setApplicationLogo, switchRegionMode,
} from '../../index';

export interface ExpectedView {
    mode?: NavigationRegionMode;
    sources: string;
    items: string[];
}

export interface View {
    module?: string;
    region: NavigationRegionKind;
    expected: ExpectedView;
}

export interface FixtureCase {
    name: string;
    structure?: ApplicationStructure;
    navigation: NavigationModel;
    slots?: string[];
    views: View[];
    expectedDiagnostics: NavigationDiagnostic[];
}

export interface EditCase {
    name: string;
    navigation: NavigationModel;
    call: { op: string; module?: string; region?: NavigationRegionKind; mode?: NavigationRegionMode; copy?: boolean; item?: never; parent?: string; logo?: never };
    expected: { edits?: NavigationEdit[]; model?: NavigationModel; rejected?: string };
}

export interface Corpus {
    structure: ApplicationStructure;
    cases: FixtureCase[];
    editCases?: EditCase[];
}

export function loadCorpus(file: string): Corpus {
    const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../../', file), 'utf-8')) as Corpus;
    corpus.cases.forEach(fixture => { fixture.structure ??= corpus.structure; });
    return corpus;
}

function lines(items: EffectiveNavItem[], depth: number): string[] {
    return items.flatMap(item => [
        `${'  '.repeat(depth)}${item.id}|${item.origin}|${item.readOnly ? 'locked' : 'editable'}|${item.target?.resolvedFeature ?? '-'}|${item.slot}|${item.icon ?? '-'}|${item.reason}`,
        ...lines(item.children ?? [], depth + 1),
    ]);
}

export function describeView(index: ApplicationStructureIndex, navigation: NavigationModel, view: View): string {
    const region = effectiveNavigation(index, navigation, view.module, view.region);
    const mode = region.mode ? `mode=${region.mode}\n` : '';
    return `${mode}${region.sources.kind}|${region.sources.label}\n${lines(region.items, 0).join('\n')}`;
}

export function describeExpected(view: View): string {
    const mode = view.expected.mode ? `mode=${view.expected.mode}\n` : '';
    return `${mode}${view.expected.sources}\n${view.expected.items.join('\n')}`;
}

export function plan(fixture: EditCase): NavigationEditPlan {
    const call = fixture.call as unknown as { op: string; module?: string; region: NavigationRegionKind; mode: NavigationRegionMode; copy?: boolean; item: never; parent?: string; logo: never };
    switch (call.op) {
        case 'switchRegionMode': return switchRegionMode(fixture.navigation, call.module, call.region, call.mode, { copy: call.copy });
        case 'addNavItem': return addNavItem(fixture.navigation, call.module, call.region, call.item, call.parent);
        case 'setApplicationLogo': return setApplicationLogo(fixture.navigation, call.module, call.logo);
        default: throw new Error(`Unknown edit helper '${call.op}'.`);
    }
}
