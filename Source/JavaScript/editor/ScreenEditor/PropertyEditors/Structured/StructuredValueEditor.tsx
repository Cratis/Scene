// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { PrimitiveListEditor } from './PrimitiveListEditor';
import { ScalarEditor } from './ScalarEditor';
import { StringMapEditor } from './StringMapEditor';
import { StringOrListEditor } from './StringOrListEditor';
import { asList, isCollectionOfRecords, isObjectWithFields, isPrimitiveList, isRecord, isStringMap, scalarEditorKind, stringOrListEditorKind, identified, movedItem, newItem, withField, withItem, withoutItem } from './structuredValue';
import type { StructuredEditorStrings } from './StructuredEditorStrings';
import './StructuredValueEditor.css';

export interface StructuredValueEditorProps {
    descriptor: PropertyDescriptor;

    // What the property holds now; undefined when it is not set.
    value: unknown;

    // Distinguishes the controls of editors drawn side by side.
    idPrefix: string;
    strings: StructuredEditorStrings;
    disabled: boolean;

    // The whole new value, or undefined to unset it.
    onChange: (value: unknown) => void;
}

// Edits a value from the descriptor that describes it: a field for each property of an object, a row for each item of a collection
// and a control for each kind of plain value, nested as deep as the descriptor goes. It never shows or asks for JSON text - what a
// descriptor does not describe is reported, not edited blind.
export const StructuredValueEditor = ({ descriptor, value, idPrefix, strings, disabled, onChange }: StructuredValueEditorProps) => {
    const id = `${idPrefix}-${descriptor.path}`;

    switch (descriptor.valueType) {
        case PropertyValueType.String:
            return (
                <label className='studio-editor-structured__field'>
                    <span>{descriptor.label}</span>
                    <input id={id} disabled={disabled} value={typeof value === 'string' ? value : ''} onChange={event => onChange(event.target.value === '' ? undefined : event.target.value)} />
                </label>
            );

        // An icon inside an item - an outlet button's - is kept as the `library#key` text Scene's model gives it, and edited as that text.
        case PropertyValueType.Icon:
            if (value === undefined || typeof value === 'string') {
                return (
                    <label className='studio-editor-structured__field'>
                        <span>{descriptor.label}</span>
                        <input id={id} disabled={disabled} placeholder='Cratis.Icons.Lucide#plus' value={value ?? ''} onChange={event => onChange(event.target.value === '' ? undefined : event.target.value)} />
                    </label>
                );
            }
            break;

        case PropertyValueType.Number:
            return (
                <label className='studio-editor-structured__field'>
                    <span>{descriptor.label}</span>
                    <input id={id} type='number' disabled={disabled} value={typeof value === 'number' ? String(value) : ''} onChange={event => onChange(event.target.value === '' ? undefined : Number(event.target.value))} />
                </label>
            );

        case PropertyValueType.Boolean:
            return (
                <label className='studio-editor-structured__field studio-editor-structured__field--flag'>
                    <input id={id} type='checkbox' disabled={disabled} checked={value === true} onChange={event => onChange(event.target.checked)} />
                    <span>{descriptor.label}</span>
                </label>
            );

        case PropertyValueType.Enum: {
            const choices = descriptor.choices ?? [];
            const selected = choices.findIndex(choice => choice.value === value);
            return (
                <label className='studio-editor-structured__field'>
                    <span>{descriptor.label}</span>
                    <select id={id} disabled={disabled} value={selected < 0 ? '' : String(selected)} onChange={event => onChange(event.target.value === '' ? undefined : choices[Number(event.target.value)]?.value)}>
                        <option value=''>{strings.unset}</option>
                        {choices.map((choice, index) => <option key={index} value={String(index)}>{choice.label}</option>)}
                    </select>
                </label>
            );
        }
    }

    if (isPrimitiveList(descriptor) && descriptor.editorKind === scalarEditorKind) {
        return (
            <label className='studio-editor-structured__field'>
                <span>{descriptor.label}</span>
                <ScalarEditor label={descriptor.label} value={value} id={id} strings={strings} disabled={disabled} onChange={onChange} />
            </label>
        );
    }

    if (isPrimitiveList(descriptor) && descriptor.editorKind === stringOrListEditorKind) {
        return <StringOrListEditor descriptor={descriptor} value={value} id={id} strings={strings} disabled={disabled} onChange={onChange} />;
    }

    if (isStringMap(descriptor)) {
        return <StringMapEditor descriptor={descriptor} value={value} id={id} strings={strings} disabled={disabled} onChange={onChange} />;
    }

    if (isPrimitiveList(descriptor)) {
        return <PrimitiveListEditor descriptor={descriptor} value={value} id={id} strings={strings} disabled={disabled} onChange={onChange} />;
    }

    if (isObjectWithFields(descriptor)) {
        return (
            <fieldset className='studio-editor-structured__object' disabled={disabled}>
                <legend>{descriptor.label}</legend>
                {descriptor.properties!.map(field => (
                    <StructuredValueEditor
                        key={field.path}
                        descriptor={field}
                        value={isRecord(value) ? value[field.path] : undefined}
                        idPrefix={id}
                        strings={strings}
                        disabled={disabled}
                        onChange={fieldValue => onChange(withField(value, field.path, fieldValue))}
                    />
                ))}
            </fieldset>
        );
    }

    if (isCollectionOfRecords(descriptor)) {
        const items = asList(value);
        const itemLabel = descriptor.item!.label ?? strings.item;
        const positional = descriptor.item!.positional === true;
        return (
            <fieldset className='studio-editor-structured__collection' disabled={disabled}>
                <legend>{descriptor.label}</legend>
                {items.map((item, index) => (
                    <fieldset key={!positional && isRecord(item) && typeof item.id === 'string' ? item.id : index} className='studio-editor-structured__item'>
                        <legend>{strings.itemTitle(itemLabel, index + 1)}</legend>
                        {descriptor.item!.properties.map(field => (
                            <StructuredValueEditor
                                key={field.path}
                                descriptor={field}
                                value={isRecord(item) ? item[field.path] : undefined}
                                idPrefix={`${id}-${index}`}
                                strings={strings}
                                disabled={disabled}
                                onChange={fieldValue => onChange(withItem(items, index, withField(identified(item, positional), field.path, fieldValue) ?? {}))}
                            />
                        ))}
                        <div className='studio-editor-structured__actions'>
                            <button type='button' aria-label={strings.moveUp(itemLabel, index + 1)} disabled={index === 0} onClick={() => onChange(movedItem(items, index, -1))}>{strings.moveUpText}</button>
                            <button type='button' aria-label={strings.moveDown(itemLabel, index + 1)} disabled={index === items.length - 1} onClick={() => onChange(movedItem(items, index, 1))}>{strings.moveDownText}</button>
                            <button type='button' aria-label={strings.remove(itemLabel, index + 1)} onClick={() => onChange(withoutItem(items, index))}>{strings.removeText}</button>
                        </div>
                    </fieldset>
                ))}
                <button type='button' disabled={descriptor.constraints?.maximumItems !== undefined && items.length >= descriptor.constraints.maximumItems} onClick={() => onChange([...items, newItem(positional)])}>{strings.add(itemLabel)}</button>
            </fieldset>
        );
    }

    // The descriptor names a kind of value this editor has no control for. Saying so is the point: a box of raw JSON would let
    // the author change what nothing describes.
    return <p className='studio-editor-structured__undescribed' role='alert'>{strings.noEditor(descriptor.label)}</p>;
};
