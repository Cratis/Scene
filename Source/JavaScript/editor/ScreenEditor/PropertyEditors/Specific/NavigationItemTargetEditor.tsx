// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicationStructure, FeatureNode } from '@cratis/scene.model';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { isRecord } from '../Structured/structuredValue';

// What an item of a navigation region leads to: a module - which opens its first feature (NAV11) - or a feature of it. The value is `{ module, feature? }`, where
// `feature` is the dotted path inside the module, the way Scene's navigation model holds it.
export interface NavigationItemTarget {
    module: string;
    feature?: string;
}

const targetOf = (value: unknown): NavigationItemTarget | undefined =>
    isRecord(value) && typeof value.module === 'string' && value.module !== '' ? { module: value.module, ...(typeof value.feature === 'string' && value.feature !== '' ? { feature: value.feature } : {}) } : undefined;

const same = (a: NavigationItemTarget | undefined, b: NavigationItemTarget | undefined) => a?.module === b?.module && (a?.feature ?? '') === (b?.feature ?? '');

interface Row {
    key: string;
    label: string;
    depth: number;
    target: NavigationItemTarget;
    module: boolean;

    // The module the row belongs to, for the scope rule below.
    owner: string;
}

function featureRows(module: string, features: readonly FeatureNode[], prefix: string, depth: number): Row[] {
    return features.flatMap(feature => {
        const path = prefix ? `${prefix}.${feature.id}` : feature.id;
        return [{ key: `${module}.${path}`, label: feature.name, depth, target: { module, feature: path }, module: false, owner: module }, ...featureRows(module, feature.features, path, depth + 1)];
    });
}

export const rowsOf = (structure: ApplicationStructure): Row[] =>
    structure.modules.flatMap(module => [{ key: module.id, label: module.name, depth: 0, target: { module: module.id }, module: true, owner: module.id }, ...featureRows(module.id, module.features, '', 1)]);

// The tree of the application: "Not linked", then each module with its features indented and `module` tagged at the right (spec p11-2). The current target is
// highlighted; a target the application no longer has stays shown, marked as missing, so it can be seen and replaced.
export const NavigationItemTargetEditor = ({ value, onChange, context, disabled, id }: PropertyEditorProps<unknown>) => {
    const text = context.strings.editors.navigationItemTarget;
    const structure = context.lookups.structure ?? { modules: [] };
    const rows = rowsOf(structure);
    const current = targetOf(value);
    // Scene's scope rule: a module's own items may only target that module (`navTargetOutOfScope`); the application's items may target any. Another module's rows are
    // listed - so the whole application is seen - but cannot be chosen from a module, and say why.
    const scope = context.lookups.navigationModule;
    const outOfScope = (row: Row) => scope !== undefined && row.owner !== scope;
    const missing = current !== undefined && !rows.some(row => same(row.target, current));

    return (
        <div id={id} className='studio-editor-target' role='listbox' aria-labelledby={`${id}-label`} aria-disabled={disabled}>
            <button type='button' role='option' aria-selected={current === undefined} disabled={disabled} className='studio-editor-target__row' data-chosen={current === undefined || undefined} onClick={() => onChange(undefined)}>
                {text.notLinked}
            </button>
            {rows.map(row => (
                <button
                    key={row.key} type='button' role='option' aria-selected={same(row.target, current)} aria-disabled={outOfScope(row) || undefined} disabled={disabled} data-module={row.module || undefined} data-chosen={same(row.target, current) || undefined}
                    className='studio-editor-target__row' title={outOfScope(row) ? text.outOfScope : undefined} style={{ paddingInlineStart: `${12 + row.depth * 16}px` }} onClick={() => { if (!outOfScope(row)) onChange(row.target); }}>
                    <span>{row.label}</span>
                    {row.module && <span className='studio-editor-target__kind'>{text.module}</span>}
                </button>
            ))}
            {missing && <span className='studio-editor-chip studio-editor-chip--error' role='alert'>{text.unresolved([current.module, current.feature].filter(Boolean).join(' › '))}</span>}
        </div>
    );
};
