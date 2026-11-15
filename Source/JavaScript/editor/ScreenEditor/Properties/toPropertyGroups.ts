// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type InspectedProperty } from '@cratis/scene.model';

// Properties a dedicated editor draws, by component: the property list leaves them to it so the same setting is not offered twice. The action
// editor owns which command runs, how its input is mapped and how its form is presented.
const drawnByTheirOwnEditor: Record<string, ReadonlySet<string>> = {
    action: new Set(['command', 'arguments', 'presentation']),
    // The command form editor owns which command the form submits, and the form it presents for it.
    commandForm: new Set(['command']),
};

export const isDrawnByItsOwnEditor = (typeId: string, path: string): boolean =>
    drawnByTheirOwnEditor[typeId.slice(typeId.lastIndexOf(':') + 1)]?.has(path) ?? false;

// What a component publishes for others to bind to - the selected row of a table - is an output of structured kind; it has no editor, because
// nothing is authored there.
const structuredKinds = new Set<string>([PropertyValueType.Object, PropertyValueType.Json, PropertyValueType.Collection]);
const isStructuredOutput = (property: InspectedProperty): boolean => property.descriptor.output === true && structuredKinds.has(property.descriptor.valueType);

// The properties the sidebar draws with the registry's editors, in the order Scene reports them: everything but what a dedicated editor draws,
// what a package draws itself (`isDrawnElsewhere`) and what the component only publishes.
export const editableProperties = (properties: readonly InspectedProperty[], typeId: string, isDrawnElsewhere: (property: InspectedProperty) => boolean = () => false): InspectedProperty[] =>
    properties.filter(property => !isDrawnByItsOwnEditor(typeId, property.descriptor.path) && !isStructuredOutput(property) && !isDrawnElsewhere(property));

export interface PropertyGroup {
    // The descriptor's group, which is the heading.
    name: string;
    properties: InspectedProperty[];
}

// Groups properties under their descriptor group, groups in order of first appearance and each group's properties in the order given.
export function groupProperties(properties: readonly InspectedProperty[]): PropertyGroup[] {
    const groups = new Map<string, InspectedProperty[]>();
    for (const property of properties) groups.set(property.descriptor.group, [...(groups.get(property.descriptor.group) ?? []), property]);
    return [...groups.entries()].map(([name, grouped]) => ({ name, properties: grouped }));
}
