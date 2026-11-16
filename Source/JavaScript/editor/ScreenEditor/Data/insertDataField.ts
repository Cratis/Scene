// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode, QueryResultShape, type Form, type FormField, type QueryCandidate, type SceneElement } from '@cratis/scene.model';
import type { PackageCatalog } from '@cratis/scene.engine';
import { commandNameOf, sliceNamedBy, type StateChangeSlice } from '../Actions/StateChangeSlice';
import { createExternalComponent } from '../Document/createExternalComponent';
import { createPanel } from '../Document/createPanel';
import { screenName } from '../Document/studioScreen';
import { commandFormComponentName, commandFormElements, commandProperty } from '../Forms/commandFormElements';
import { formWithLayout } from '../Forms/commandFormLayout';
import { choicesOf, inferChoices, withChoices } from '../Forms/fieldChoices';
import { formOfCommand, manualFormFor, modeFor } from '../Forms/formEditing';
import { LayoutItem } from '../Layouts/LayoutItem';
import { bindToCandidate, mapColumn, placeColumn, unmapColumn } from '../Binding/queryBindingModel';
import { insertedComponentName } from '../Palette/insertedComponentName';
import { findSceneElement } from '../Selection/sceneTree';
import type { CanvasPlacement } from '../Document/placeOnCanvas';
import type { TableDrop } from '../Surface/columnAt';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { DataField, QueryDataField, QueryResultDataField } from './DataField';
import { bindingEdit, queryTableOf, queryTablesOf, tableComponentNames } from './queryTables';

export const singleResultComponentName = 'singleResult';

// How many columns a table made by dropping its query starts with, and how many fields a summary does; the author ticks or drags the rest.
export const initialTableColumns = 4;
export const initialSummaryFields = 6;

export interface DataFieldTarget {
    parentId: string | undefined;
    index: number | undefined;
    at?: CanvasPlacement;

    // The table the field was let go over, and the column position under the pointer when the table draws headers.
    over?: TableDrop;
}

export interface DataFieldInsertion {
    controller: Pick<ScreenEditorController, 'document' | 'composition' | 'insertElement' | 'setScreenForms' | 'select' | 'apply'>;
    packages: PackageCatalog;
    stateChangeSlices: readonly StateChangeSlice[];
    queryCandidates: readonly QueryCandidate[];

    // Whether a component - by the name it is added with - has a property bound to a query: only such a table can show the rows of one.
    bindsQuery: (componentName: string) => boolean;
    newId: () => string;
}

// Why a field could not be made; undefined when it was.
export type DataFieldRefusal = 'unknownCommand' | 'unknownQuery' | 'noCommandForm' | 'noSingleResult' | 'noTable';

// The name a component goes onto the screen with, from the package that offers it - none when the application's profile has no package
// offering it, so a field is never made of a component the screen cannot draw.
export function componentNamed(packages: PackageCatalog, component: string): string | undefined {
    const offering = Object.entries(packages).find(([, components]) => components.includes(component));
    return offering ? insertedComponentName(component, offering[0]) : undefined;
}

// The table a package of the profile offers that can be bound to a query - not just any table, since a table that takes its rows by hand shows nothing of a query.
const tableComponentIn = (packages: PackageCatalog, bindsQuery: (componentName: string) => boolean): string | undefined =>
    Object.entries(packages).flatMap(([packageName, components]) => tableComponentNames.filter(name => components.includes(name)).map(name => insertedComponentName(name, packageName))).find(bindsQuery);

// A field bound to a command property; a property whose type is the key of a list query's rows is a picker over that query.
function boundField(property: string, type: string, candidates: readonly QueryCandidate[]): FormField {
    return withChoices({ name: property, sourceProperty: property, label: property }, inferChoices(type, candidates));
}

// Makes the field a dropped piece of data stands for. A command property becomes a field of the screen's form for the command - on the command
// form already on the screen, or on one put where it was dropped; a field of what a query returns becomes a column of the table over that query,
// or a single result showing it; a whole query becomes a table, or a summary.
export function insertDataField(field: DataField, target: DataFieldTarget, insertion: DataFieldInsertion): DataFieldRefusal | undefined {
    switch (field.source) {
        case 'command': return placeCommandFields(field.sliceId, [{ property: field.property, type: field.type }], target, insertion, `Bind ${field.property}`);
        case 'queryResult': return insertQueryResult(field, target, insertion);
        case 'query': return insertQueryField(field, target, insertion);
    }
}

// Places every property of the screen's command on its form - Generate the form. What is already there stays where it is.
export function generateForm(sliceId: string, target: DataFieldTarget, insertion: DataFieldInsertion): DataFieldRefusal | undefined {
    const slice = sliceNamedBy(insertion.stateChangeSlices, sliceId);
    if (!slice) return 'unknownCommand';
    return placeCommandFields(sliceId, slice.inputs.map(input => ({ property: input.name, type: input.type })), target, insertion, `Generate the form for ${commandNameOf(slice)}`);
}

function placeCommandFields(sliceId: string, properties: { property: string; type: string }[], target: DataFieldTarget, { controller, packages, stateChangeSlices, queryCandidates, newId }: DataFieldInsertion, label: string): DataFieldRefusal | undefined {
    const slice = sliceNamedBy(stateChangeSlices, sliceId);
    if (!slice) return 'unknownCommand';
    const forms = controller.document.screens.find(screen => screen.name === screenName)?.forms ?? [];
    const form = formOfCommand(forms, slice);
    const placed = commandFormElements(controller.composition.roots, stateChangeSlices).find(element => element.command === slice.id || element.commandName === commandNameOf(slice));

    // Without a command form already on the screen one is put there, so a profile that cannot draw one refuses before anything changes.
    const componentName = placed ? undefined : componentNamed(packages, commandFormComponentName);
    if (!placed && !componentName) return 'noCommandForm';

    // The screen's form for the command, with the dropped properties bound after the fields it has - written out by hand from then on, since
    // an automatic form follows the command and has no fields of its own to add to.
    const name = commandNameOf(slice);
    const has = (candidate: Form, property: string) => candidate.fields.some(existing => (existing.sourceProperty ?? existing.name) === property || existing.name === property);
    const extended = (() => {
        const missing = (candidate: Form) => properties.filter(({ property }) => !has(candidate, property));
        if (!form) return formWithLayout({ name, forCommand: name, generationMode: FormGenerationMode.Manual, fields: properties.map(({ property, type }) => boundField(property, type, queryCandidates)) });
        if (missing(form).length === 0) return form;
        const written = modeFor(form, slice) === FormGenerationMode.Auto ? manualFormFor(form, slice) : form;
        const added = missing(written);
        return formWithLayout({ ...written, fields: [...written.fields.map(existing => withInferredChoices(existing, slice, queryCandidates)), ...added.map(({ property, type }) => boundField(property, type, queryCandidates))] });
    })();
    if (extended !== form) controller.setScreenForms(form ? forms.map(candidate => candidate === form ? extended : candidate) : [...forms, extended], label);

    if (placed) {
        controller.select(placed.elementId);
        return undefined;
    }

    controller.insertElement(createExternalComponent(newId(), name, componentName!, { [commandProperty]: slice.id }), target.parentId, target.index, label, target.at);
    return undefined;
}

// A field of a form that was generated automatically has no picker written, though its property may imply one; once the form is written out
// by hand the picker is written with it, so what the author sees is what Screenplay says.
function withInferredChoices(field: FormField, slice: StateChangeSlice, candidates: readonly QueryCandidate[]): FormField {
    if (choicesOf(field)) return field;
    const input = slice.inputs.find(candidate => candidate.name === (field.sourceProperty ?? field.name));
    const inferred = input ? inferChoices(input.type, candidates) : undefined;
    return inferred ? withChoices(field, inferred) : field;
}

const isIdentity = (field: { isIdentity?: boolean }) => field.isIdentity === true;

function insertQueryResult(field: QueryResultDataField, target: DataFieldTarget, { controller, packages, queryCandidates, bindsQuery, newId }: DataFieldInsertion): DataFieldRefusal | undefined {
    const candidate = queryCandidates.find(query => query.id === field.queryId);
    if (!candidate) return 'unknownQuery';
    if (candidate.resultShape === QueryResultShape.Collection) {
        const componentName = tableComponentIn(packages, bindsQuery);
        if (!componentName) return 'noTable';
        const shown = candidate.resultFields.filter(result => !isIdentity(result)).slice(0, initialTableColumns);
        const binding = shown.reduce((current, result) => mapColumn(current, result.name), bindToCandidate(candidate));
        const key = candidate.resultFields.find(isIdentity);
        controller.insertElement(createExternalComponent(newId(), candidate.name, componentName, { query: binding, ...(key ? { dataKey: key.name } : {}) }), target.parentId, target.index, `Show ${candidate.name} as a table`, target.at);
        return undefined;
    }

    const singleResult = componentNamed(packages, singleResultComponentName);
    if (!singleResult) return 'noSingleResult';
    const shown = candidate.resultFields.filter(result => !isIdentity(result)).slice(0, initialSummaryFields);
    const summary = shown.map(result => createExternalComponent(newId(), result.name, singleResult, { query: mapColumn(bindToCandidate(candidate), result.name), resultField: result.name, queryArguments: {} }));
    controller.insertElement(createPanel(LayoutItem.Stack, newId(), `${candidate.name} summary`, summary), target.parentId, target.index, `Show ${candidate.name} as a summary`, target.at);
    return undefined;
}

function insertQueryField(field: QueryDataField, target: DataFieldTarget, insertion: DataFieldInsertion): DataFieldRefusal | undefined {
    const { controller, packages, queryCandidates, bindsQuery, newId } = insertion;
    const candidate = queryCandidates.find(query => query.id === field.queryId);
    if (!candidate) return 'unknownQuery';

    if (candidate.resultShape === QueryResultShape.Collection) {
        // A field of a list is a column: of the table it was dropped on, or else of the one the screen has over the query - or of a table made for it.
        const over = target.over ? findSceneElement(controller.composition.roots, target.over.elementId) : undefined;
        const dropped = target.parentId ? findSceneElement(controller.composition.roots, target.parentId) : undefined;
        const table = [over, dropped].map(element => element ? queryTableOf(element as SceneElement) : undefined).find(candidateTable => candidateTable?.binding.queryId === candidate.id)
            ?? queryTablesOf(controller.composition.roots).find(candidateTable => candidateTable.binding.queryId === candidate.id);
        if (table && table.binding.queryId === candidate.id) {
            const column = table.elementId === target.over?.elementId ? target.over.column : undefined;
            controller.apply(bindingEdit(table.elementId, placeColumn(table.binding, field.field, column)), column === undefined ? `Show ${field.field}` : `Place ${field.field} at column ${column + 1}`);
            controller.select(table.elementId);
            return undefined;
        }

        const componentName = tableComponentIn(packages, bindsQuery);
        if (!componentName) return 'noTable';
        const key = candidate.resultFields.find(isIdentity);
        controller.insertElement(createExternalComponent(newId(), candidate.name, componentName, { query: mapColumn(bindToCandidate(candidate), field.field), ...(key ? { dataKey: key.name } : {}) }), target.parentId, target.index, `Show ${candidate.name} ${field.field}`, target.at);
        return undefined;
    }

    const componentName = componentNamed(packages, singleResultComponentName);
    if (!componentName) return 'noSingleResult';
    const properties = { query: mapColumn(bindToCandidate(candidate), field.field), resultField: field.field, queryArguments: {} };
    controller.insertElement(createExternalComponent(newId(), field.field, componentName, properties), target.parentId, target.index, `Bind ${candidate.name} ${field.field}`, target.at);
    return undefined;
}

// Takes a column off every table the screen has over the query.
export function removeQueryColumn(field: QueryDataField, { controller }: Pick<DataFieldInsertion, 'controller'>): void {
    for (const table of queryTablesOf(controller.composition.roots).filter(candidate => candidate.binding.queryId === field.queryId)) {
        if (table.binding.results.some(result => result.field === field.field)) controller.apply(bindingEdit(table.elementId, unmapColumn(table.binding, field.field)), `Hide ${field.field}`);
    }
}
