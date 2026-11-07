// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApplicationLogo, ApplicationStructure, NavigationModel, OutletItem, OutletMode } from '@cratis/scene.model';
import {
    ApplicationStructureIndex, EffectiveNavButton, EffectiveNavItem, NavigationDiagnostic, NavigationEdit, NavigationEditPlan,
    addNavigationItem, duplicateNavigationItem, effectiveNavigation, moveNavigationItem, removeNavigationItem, renameNavigationItem,
    setApplicationLogo, switchOutletMode,
} from '../../index';

export interface ExpectedView {
    mode?: OutletMode;
    sources: string;
    items: string[];
    buttons?: string[];
}

export interface View {
    module?: string;
    outlet: string;
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

export interface EditCall {
    op: string;
    module?: string;
    outlet: string;
    mode?: OutletMode;
    copy?: boolean;
    item?: OutletItem;
    id?: string;
    title?: string;
    newId?: string;
    parent?: string;
    index?: number;
    logo?: ApplicationLogo;
}

export interface EditCase {
    name: string;
    navigation: NavigationModel;
    call: EditCall;
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

function buttonLines(buttons: EffectiveNavButton[]): string {
    return buttons.length === 0 ? '' : `\nbuttons\n${buttons.map(button => `${button.id}|${button.origin}|${button.readOnly ? 'locked' : 'editable'}|${button.emphasis}|${button.slice ?? '-'}|${button.icon ?? '-'}|${button.authorize ?? '-'}|${button.reason}`).join('\n')}`;
}

export function describeView(index: ApplicationStructureIndex, navigation: NavigationModel, view: View): string {
    const resolved = effectiveNavigation(index, navigation, view.module, view.outlet);
    const mode = resolved.mode ? `mode=${resolved.mode}\n` : '';
    return `${mode}${resolved.sources.kind}|${resolved.sources.label}\n${lines(resolved.items, 0).join('\n')}${buttonLines(resolved.buttons)}`;
}

export function describeExpected(view: View): string {
    const mode = view.expected.mode ? `mode=${view.expected.mode}\n` : '';
    return `${mode}${view.expected.sources}\n${view.expected.items.join('\n')}${view.expected.buttons?.length ? `\nbuttons\n${view.expected.buttons.join('\n')}` : ''}`;
}

export function plan(fixture: EditCase): NavigationEditPlan {
    const call = fixture.call;
    switch (call.op) {
        case 'switchOutletMode': return switchOutletMode(fixture.navigation, call.module, call.outlet, call.mode!, { copy: call.copy });
        case 'addNavigationItem': return addNavigationItem(fixture.navigation, call.module, call.outlet, call.item!, call.parent, call.index);
        case 'renameNavigationItem': return renameNavigationItem(fixture.navigation, call.module, call.outlet, call.id!, call.title!);
        case 'moveNavigationItem': return moveNavigationItem(fixture.navigation, call.module, call.outlet, call.id!, { parent: call.parent, index: call.index });
        case 'duplicateNavigationItem': return duplicateNavigationItem(fixture.navigation, call.module, call.outlet, call.id!, call.newId);
        case 'removeNavigationItem': return removeNavigationItem(fixture.navigation, call.module, call.outlet, call.id!);
        case 'setApplicationLogo': return setApplicationLogo(fixture.navigation, call.module, call.logo!);
        default: throw new Error(`Unknown edit helper '${call.op}'.`);
    }
}
