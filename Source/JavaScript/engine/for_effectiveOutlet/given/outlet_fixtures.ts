// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DialogTemplate, Outlet, OutletItem, OutletItemKind, OutletRefinement, Toolbar } from '@cratis/scene.model';
import { EffectiveOutlet, OutletDiagnostic, OutletLevel } from '../../index';

export interface ExpectedOutlet {
    kind: string | null;
    declaredBy: string | null;
    mode: string | null;
    summary: string;
    items: string[];
    removed: string[];
    diagnostics: string[];
}

export interface OutletCase {
    name: string;
    chain: OutletLevel[];
    contributors?: OutletLevel[];
    resolve: { outlet: string; expected: ExpectedOutlet }[];
    expectedDiagnostics: string[];
}

export const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../../outlet-resolution-fixtures.json'), 'utf-8')) as {
    itemKinds: Record<string, string[]>;
    cases: OutletCase[];
    dialogTemplates: { name: string; template: DialogTemplate; expected: string[] }[];
    toolbars: { name: string; toolbar: Toolbar; expected: OutletRefinement }[];
};

export const describeDiagnostic = (diagnostic: OutletDiagnostic): string =>
    `${diagnostic.code}|${diagnostic.severity}|${diagnostic.outlet}|${diagnostic.owner ?? '-'}|${diagnostic.item ?? '-'}|${diagnostic.message}`;

const kindOf = (item: OutletItem): string =>
    item.kind === OutletItemKind.Group ? `group(${item.items.map(child => child.id).join(',')})` : item.kind;

export const describeOutlet = (outlet: EffectiveOutlet): ExpectedOutlet => ({
    kind: outlet.kind ?? null,
    declaredBy: outlet.declaredBy ?? null,
    mode: outlet.mode ?? null,
    summary: outlet.summary,
    items: outlet.items.map(entry =>
        `${entry.item.id}|${kindOf(entry.item)}|${entry.provenance.owner}|${entry.provenance.level}|${entry.provenance.source}|${entry.editable ? 'editable' : 'locked'}`),
    removed: outlet.removed.map(entry => `${entry.item.id}|${entry.removal}|by ${entry.removedBy}|from ${entry.provenance.owner}`),
    diagnostics: outlet.diagnostics.map(describeDiagnostic),
});

export const describeDialogOutlet = (outlet: Outlet): string =>
    `${outlet.name}|${outlet.kind}|${outlet.defaults.map(item => item.kind === OutletItemKind.Button ? `${item.id}:${item.builtIn ?? '-'}:${item.emphasis ?? '-'}` : item.id).join(',')}`;
