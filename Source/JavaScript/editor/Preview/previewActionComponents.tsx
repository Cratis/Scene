// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentRegistryKey, useOptionalSceneNavigation, useRenderBindingScope, useSliceCommandFields, sliceFieldLabel, type ComponentRegistry, type RegisteredComponentProps } from '@cratis/scene.react';
import { FormFields, type FormFieldView } from '../ScreenEditor/Forms/FormFields';
import { sentByTheDialogProperty } from './sentByTheDialog';
import { previewActionLabel } from './previewActionLabel';
import { previewActionClick } from './previewActionClick';

function PreviewAction({ element }: RegisteredComponentProps) {
    const scope = useRenderBindingScope();
    return (
        <button type='button' data-scene-id={element.id} className='studio-preview-action' onClick={previewActionClick(element, scope)}>
            {previewActionLabel(element.properties)}
        </button>
    );
}

const inputTypeOf = (type: string): FormFieldView['type'] => {
    switch (type.toLowerCase()) {
        case 'number': return 'number';
        case 'boolean': return 'checkbox';
        case 'date': return 'date';
        default: return 'text';
    }
};

/**
 * A command form a screen places itself. Scene's own form is bound to an Arc command proxy the host registers, and a preview has none - the application is
 * not running - so it drew `Unresolved command binding` in red. The preview draws the form the screen editor draws: its fields on the grid of the form's
 * layout, with the sample values the preview was given. On a page it has its submit button; in a dialog the dialog's Cancel and Submit send it, as the
 * screen editor shows. Submitting does nothing, as in the dialog.
 */
function PreviewCommandForm({ element }: RegisteredComponentProps) {
    const fieldsFor = useSliceCommandFields();
    const navigation = useOptionalSceneNavigation();
    const command = typeof element.properties.command === 'string' ? element.properties.command : '';
    const submitLabel = typeof element.properties.submitLabel === 'string' && element.properties.submitLabel !== '' ? element.properties.submitLabel : previewActionLabel({ command });
    const excluded = Array.isArray(element.properties.exclude) ? element.properties.exclude : [];
    const inDialog = element.properties[sentByTheDialogProperty] === true;
    const fields = (fieldsFor?.(command, '') ?? []).filter(field => !excluded.includes(field.name)).map(field => ({
        name: field.name,
        label: sliceFieldLabel(field),
        required: field.required === true,
        type: inputTypeOf(field.type),
        ...(field.initialValue === undefined ? {} : { value: typeof field.initialValue === 'boolean' ? field.initialValue : String(field.initialValue) }),
    }));
    return (
        <form data-scene-id={element.id} data-preview-command-form={command} className='studio-preview-command-form' onSubmit={event => event.preventDefault()}>
            <FormFields fields={fields} layout={element.properties.layout} />
            {inDialog
                ? (
                    <div className='scene-outlet scene-outlet-actions studio-preview-command-form__actions' data-preview-dialog-actions=''>
                        <button type='button' className='scene-toolbar-button scene-toolbar-button-secondary' onClick={() => navigation?.closeDialog()}>Cancel</button>
                        <button type='submit' className='scene-toolbar-button scene-toolbar-button-primary'>Submit</button>
                    </div>
                )
                : <button type='submit' className='studio-preview-action'>{submitLabel}</button>}
        </form>
    );
}

export const previewActionComponents: ComponentRegistry = {
    [componentRegistryKey('core', 'action')]: PreviewAction,
    [componentRegistryKey('Cratis.Components', 'commandForm')]: PreviewCommandForm,
};
