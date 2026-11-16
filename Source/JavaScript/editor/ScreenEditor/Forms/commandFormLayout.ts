// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormWidthUnit, type CommandFormLayout, type Form, type FormField, type FormFieldPlacement, type FormWidth } from '@cratis/scene.model';

export const defaultFormWidth = (value = 1, unit = FormWidthUnit.Fraction): FormWidth => unit === FormWidthUnit.Auto ? { unit } : { unit, value };

export function defaultFormLayout(fields: readonly FormField[]): CommandFormLayout {
    return {
        columns: [
            { index: 1, width: defaultFormWidth(1) },
            { index: 2, width: defaultFormWidth(1) },
        ],
        placements: fields.map((field, index) => defaultPlacementFor(field.name, index)),
        columnGap: defaultFormWidth(16, FormWidthUnit.Pixels),
        rowGap: defaultFormWidth(12, FormWidthUnit.Pixels),
    };
}

// Columns, rows and placements are numbered from one, as Scene's model and Screenplay's language have them. A form saved before that
// was so numbered its columns from zero; it is read as the same grid, one further along, so the export no longer drops it.
function numberedFromOne(form: Form): Form {
    const layout = form.layout;
    const fromZero = layout !== undefined && (layout.columns.some(column => column.index < 1) || layout.placements.some(placement => placement.row < 1 || placement.column < 1));
    if (!fromZero) return form;
    const shift = (placement: FormFieldPlacement): FormFieldPlacement => ({ ...placement, row: placement.row + 1, column: placement.column + 1 });
    return {
        ...form,
        layout: { ...layout, columns: layout.columns.map(column => ({ ...column, index: column.index + 1 })), placements: layout.placements.map(shift) },
        fields: form.fields.map(field => field.placement ? { ...field, placement: shift(field.placement) } : field),
    };
}

export function formWithLayout(source: Form): Form {
    const form = numberedFromOne(source);
    const layout = form.layout ?? defaultFormLayout(form.fields);
    const placements = form.fields.map((field, index) => placementFor(layout, field.name) ?? field.placement ?? defaultPlacementFor(field.name, index));
    return {
        ...form,
        layout: { ...layout, placements },
        fields: form.fields.map((field, index) => ({ ...field, placement: placements[index] })),
    };
}

export function updateFieldPlacement(form: Form, fieldName: string, update: (placement: FormFieldPlacement) => FormFieldPlacement): Form {
    const withLayout = formWithLayout(form);
    const existing = placementFor(withLayout.layout!, fieldName) ?? defaultPlacementFor(fieldName, withLayout.fields.findIndex(field => field.name === fieldName));
    const nextPlacement = normalizePlacement(update(existing));
    return {
        ...withLayout,
        layout: { ...withLayout.layout!, placements: withLayout.layout!.placements.map(placement => placement.field === fieldName ? nextPlacement : placement) },
        fields: withLayout.fields.map(field => field.name === fieldName ? { ...field, placement: nextPlacement } : field),
    };
}

export function updateColumnWidth(form: Form, index: number, width: FormWidth): Form {
    const withLayout = formWithLayout(form);
    const columns = withLayout.layout!.columns.some(column => column.index === index)
        ? withLayout.layout!.columns.map(column => column.index === index ? { ...column, width } : column)
        : [...withLayout.layout!.columns, { index, width }];
    return { ...withLayout, layout: { ...withLayout.layout!, columns: columns.sort((first, second) => first.index - second.index) } };
}

export function updateGap(form: Form, gap: 'columnGap' | 'rowGap', width: FormWidth): Form {
    const withLayout = formWithLayout(form);
    return { ...withLayout, layout: { ...withLayout.layout!, [gap]: width } };
}

function placementFor(layout: CommandFormLayout, fieldName: string): FormFieldPlacement | undefined {
    return layout.placements.find(placement => placement.field === fieldName);
}

function defaultPlacementFor(field: string, index: number): FormFieldPlacement {
    return { field, row: Math.floor(index / 2) + 1, column: (index % 2) + 1, rowSpan: 1, columnSpan: 1 };
}

function normalizePlacement(placement: FormFieldPlacement): FormFieldPlacement {
    return {
        ...placement,
        row: Math.max(1, placement.row),
        column: Math.max(1, placement.column),
        rowSpan: Math.max(1, placement.rowSpan ?? 1),
        columnSpan: Math.max(1, placement.columnSpan ?? 1),
    };
}
