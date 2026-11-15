// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryResultShape, type FormField, type QueryCandidate, type QueryResultField } from '@cratis/scene.model';

// Where a picker gets what it offers: Screenplay's `choose from query <Query> show <field>` on a form field.
export interface FieldChoices {
    query: string;
    show: string;
}

// A form field as the screen's document stores it: Scene's fields, and the picker a field may carry for Screenplay to write.
export type ChoiceField = FormField & { choices?: FieldChoices };

export const choicesOf = (field: FormField): FieldChoices | undefined => (field as ChoiceField).choices;

export function withChoices(field: FormField, choices: FieldChoices | undefined): FormField {
    const { choices: _, ...rest } = field as ChoiceField;
    return choices ? { ...rest, choices } as FormField : rest;
}

const isListQuery = (candidate: QueryCandidate): boolean => candidate.resultShape === QueryResultShape.Collection;

// The queries a picker can choose from: the ones that return a list.
export const listQueriesOf = (candidates: readonly QueryCandidate[]): QueryCandidate[] => candidates.filter(isListQuery);

// What a picker over a query shows by default: the rows' `name` or `title` field, or else the first field that is not the key.
export function defaultDisplayField(candidate: QueryCandidate): QueryResultField | undefined {
    const fields = candidate.resultFields;
    return fields.find(field => field.name === 'name' || field.name === 'title') ?? fields.find(field => !field.isIdentity) ?? fields[0];
}

// The picker Screenplay infers for a property of this type: when the type is the key of the rows of exactly one list query it chooses from that
// query and shows the display field. Screenplay applies the same rule when it compiles, so the picker the editor shows is the one the text has.
export function inferChoices(type: string, candidates: readonly QueryCandidate[]): FieldChoices | undefined {
    const keyed = listQueriesOf(candidates).filter(candidate => candidate.resultFields.some(field => field.isIdentity === true && field.type === type));
    if (keyed.length !== 1) return undefined;
    const show = defaultDisplayField(keyed[0]);
    return show ? { query: keyed[0].name, show: show.name } : undefined;
}

// The choices a field has: the ones it states, or else the ones its command property's type implies.
export const choicesFor = (field: FormField, type: string | undefined, candidates: readonly QueryCandidate[]): FieldChoices | undefined =>
    choicesOf(field) ?? (type ? inferChoices(type, candidates) : undefined);
