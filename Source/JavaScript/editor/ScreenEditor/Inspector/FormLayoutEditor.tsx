// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormWidthUnit, type Form, type FormFieldPlacement, type FormWidth } from '@cratis/scene.model';
import { defaultFormWidth, formWithLayout, updateColumnWidth, updateFieldPlacement, updateGap } from '../Forms/commandFormLayout';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface FormLayoutEditorProps {
    form: Form;
    strings: ScreenEditorStrings['properties']['forms'];
    onChange: (form: Form) => void;
}

export const FormLayoutEditor = ({ form, strings, onChange }: FormLayoutEditorProps) => {
    const withLayout = formWithLayout(form);
    const layout = withLayout.layout!;

    return (
        <div className='studio-editor-properties__form-layout'>
            <fieldset>
                <legend>{strings.columns}</legend>
                {layout.columns.map(column => (
                    <div key={column.index} className='studio-editor-properties__form-layout-row'>
                        <span>{strings.column(column.index)}</span>
                        <WidthEditor name={strings.column(column.index)} value={column.width ?? defaultFormWidth()} strings={strings} onChange={width => onChange(updateColumnWidth(withLayout, column.index, width))} />
                    </div>
                ))}
            </fieldset>
            <fieldset>
                <legend>{strings.gaps}</legend>
                <div className='studio-editor-properties__form-layout-row'>
                    <span>{strings.columnGap}</span>
                    <WidthEditor name={strings.columnGap} value={layout.columnGap ?? defaultFormWidth(0, FormWidthUnit.Pixels)} strings={strings} onChange={width => onChange(updateGap(withLayout, 'columnGap', width))} />
                </div>
                <div className='studio-editor-properties__form-layout-row'>
                    <span>{strings.rowGap}</span>
                    <WidthEditor name={strings.rowGap} value={layout.rowGap ?? defaultFormWidth(0, FormWidthUnit.Pixels)} strings={strings} onChange={width => onChange(updateGap(withLayout, 'rowGap', width))} />
                </div>
            </fieldset>
            <fieldset>
                <legend>{strings.placements}</legend>
                {withLayout.fields.map(field => {
                    const placement = layout.placements.find(candidate => candidate.field === field.name) ?? field.placement!;
                    return (
                        <fieldset key={field.name}>
                            <legend>{field.label || field.name}</legend>
                            <PlacementEditor placement={placement} strings={strings} onChange={next => onChange(updateFieldPlacement(withLayout, field.name, () => next))} />
                        </fieldset>
                    );
                })}
            </fieldset>
        </div>
    );
};

interface PlacementEditorProps {
    placement: FormFieldPlacement;
    strings: ScreenEditorStrings['properties']['forms'];
    onChange: (placement: FormFieldPlacement) => void;
}

const PlacementEditor = ({ placement, strings, onChange }: PlacementEditorProps) => (
    <>
        <NumberField label={strings.row} value={placement.row} onChange={row => onChange({ ...placement, row })} minimum={1} />
        <NumberField label={strings.columnPlacement} value={placement.column} onChange={column => onChange({ ...placement, column })} minimum={1} />
        <NumberField label={strings.rowSpan} value={placement.rowSpan ?? 1} onChange={rowSpan => onChange({ ...placement, rowSpan })} minimum={1} />
        <NumberField label={strings.columnSpan} value={placement.columnSpan ?? 1} onChange={columnSpan => onChange({ ...placement, columnSpan })} minimum={1} />
        <label>
            <span>{strings.fieldWidth}</span>
            <WidthEditor name={strings.fieldWidth} value={placement.width ?? defaultFormWidth()} strings={strings} onChange={width => onChange({ ...placement, width })} />
        </label>
    </>
);

interface WidthEditorProps {
    // What the width is of, so each of the many width controls has its own accessible name.
    name: string;
    value: FormWidth;
    strings: ScreenEditorStrings['properties']['forms'];
    onChange: (width: FormWidth) => void;
}

const WidthEditor = ({ name, value, strings, onChange }: WidthEditorProps) => (
    <span className='studio-editor-properties__form-width'>
        <input
            type='number'
            min={0}
            step='0.25'
            value={value.value ?? ''}
            disabled={value.unit === FormWidthUnit.Auto}
            aria-label={`${name} ${strings.widthValue}`}
            onChange={event => onChange(widthFrom(event.target.value, value.unit))} />
        <select value={value.unit} aria-label={`${name} ${strings.widthUnit}`} onChange={event => onChange(widthFrom(String(value.value ?? ''), event.target.value as FormWidthUnit))}>
            {Object.values(FormWidthUnit).map(unit => <option key={unit} value={unit}>{unit}</option>)}
        </select>
    </span>
);

interface NumberFieldProps {
    label: string;
    value: number;
    minimum?: number;
    onChange: (value: number) => void;
}

const NumberField = ({ label, value, minimum = 0, onChange }: NumberFieldProps) => (
    <label>
        <span>{label}</span>
        <input type='number' min={minimum} value={value} onChange={event => onChange(Math.max(minimum, Number(event.target.value)))} />
    </label>
);

function widthFrom(value: string, unit: FormWidthUnit): FormWidth {
    if (unit === FormWidthUnit.Auto) return { unit };
    const parsed = Number(value);
    return { unit, value: Number.isFinite(parsed) ? parsed : 0 };
}
