// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type {
    ScreenDataSyntax, ScreenDirectiveSyntax, ScreenNeedSyntax, ScreenSummarySyntax, ScreenTableSyntax,
    ScreenTitleSyntax, ScreenToolbarSyntax,
} from './Syntax/ScreenplaySyntax';
import type { JsonObject, JsonValue } from './json';
import { baseElement } from './sceneElementBase';
import type { SceneScreenNames } from './sceneScreenNames';
import { toolbarButtonsToJson } from './sceneOutletItems';

// The mirror of SceneCoreDirectives' import half. A directive that names a piece of content - title, data, table,
// summary - is a core component of Scene, so an imported screen opens with that content on its canvas instead of
// as an empty page. A `toolbar` of buttons is the outlet of actions Scene draws a toolbar with.
const title = 'core:title';
const data = 'core:data';
const table = 'core:table';
const column = 'core:column';
const summary = 'core:summary';
const field = 'core:field';
const outletItems = 'core:outletItems';
const typeName = 'typeName';

// A directive that says more than its element can hold - a table with a row click - is not one of these; the C#
// bridge keeps it in the native residue, and this bridge reports it.
export const isCoreElement = (directive: ScreenDirectiveSyntax): boolean => {
    switch (directive.kind) {
        case 'ScreenTitleSyntax': return true;
        case 'ScreenDataSyntax': return (directive as ScreenDataSyntax).type.isOptional !== true;
        case 'ScreenNeedSyntax': return true;
        case 'ScreenTableSyntax': {
            const table = directive as ScreenTableSyntax;
            return !table.rowClick && (table.behaviors ?? []).length === 0 && (table.usedBehaviors ?? []).length === 0;
        }
        case 'ScreenSummarySyntax': return true;
        case 'ScreenToolbarSyntax': {
            const toolbar = directive as ScreenToolbarSyntax;
            return toolbar.items.length === 0 && (toolbar.buttons ?? []).length > 0;
        }
        default: return false;
    }
};

export const coreElementOf = (directive: ScreenDirectiveSyntax, names: SceneScreenNames): JsonObject | undefined => {
    switch (directive.kind) {
        case 'ScreenTitleSyntax': {
            const node = directive as ScreenTitleSyntax;
            return component(names, 'title', node.text, title, { text: node.text });
        }
        case 'ScreenDataSyntax': {
            const node = directive as ScreenDataSyntax;
            return component(names, `data-${slug(node.type.name)}`, `Data ${node.type.name}`, data, {
                [typeName]: node.type.name,
                isCollection: node.type.isCollection,
                query: node.query,
                by: node.by,
            });
        }
        case 'ScreenNeedSyntax': {
            const node = directive as ScreenNeedSyntax;
            const named = node.alias ?? node.type.name;
            return component(names, `data-${slug(named)}`, `Data ${named}`, data, {
                [typeName]: node.type.name,
                isCollection: node.type.isCollection,
                need: node.alias,
            });
        }
        case 'ScreenTableSyntax': {
            const node = directive as ScreenTableSyntax;
            return withChildren(
                component(names, `table-${slug(node.target)}`, `Table ${node.target}`, table, { [typeName]: node.target }),
                'columns',
                node.columns.map(each => ({ property: each.property, label: each.label })),
                column,
                'column',
                names);
        }
        case 'ScreenSummarySyntax': {
            const node = directive as ScreenSummarySyntax;
            return withChildren(
                component(names, `summary-${slug(node.target)}`, `Summary ${node.target}`, summary, { [typeName]: node.target }),
                'fields',
                node.fields.map(each => ({ property: each.property, label: each.label })),
                field,
                'field',
                names);
        }
        case 'ScreenToolbarSyntax': {
            const node = directive as ScreenToolbarSyntax;
            const element = component(names, `toolbar-${slug(node.name)}`, `Toolbar ${node.name}`, outletItems, { name: node.name, kind: 'actions' });
            (element.properties as JsonObject).items = toolbarButtonsToJson(node.buttons ?? []);
            return element;
        }
        default: return undefined;
    }
};

const component = (names: SceneScreenNames, idStem: string, name: string, componentName: string, properties: Record<string, string | boolean | null | undefined>): JsonObject => {
    const element = baseElement(names.uniqueElementId(idStem), name);
    element.componentName = componentName;
    const written: JsonObject = {};
    for (const [member, value] of Object.entries(properties)) {
        // The C# writer keeps only strings and booleans; anything else - an absent 'by', an absent alias - is a
        // null the editor reads as 'not stated'.
        written[member] = typeof value === 'string' || typeof value === 'boolean' ? value : null;
    }
    element.properties = written;
    element.slots = {};
    return element;
};

const withChildren = (
    parent: JsonObject,
    outlet: string,
    children: readonly { property: string; label: string | null }[],
    componentName: string,
    kind: string,
    names: SceneScreenNames): JsonObject => {
    const id = parent.id as string;
    parent.slots = {
        [outlet]: children.map(child => component(
            names,
            `${id}-${kind}-${slug(child.property)}`,
            child.label ?? child.property,
            componentName,
            { property: child.property, label: child.label }) as JsonValue),
    };
    return parent;
};

// An id stem: lower case letters, digits and dashes, so an id reads the same in the editor, the document and a url.
export const slug = (text: string): string => {
    const mapped = [...text].map(character => /[a-z0-9]/i.test(character) ? character.toLowerCase() : '-').join('').replace(/^-+|-+$/g, '');
    return mapped.length === 0 ? 'item' : mapped;
};
