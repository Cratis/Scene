// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DialogTemplate } from '@cratis/scene.model';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface DialogTemplateListEditorProps {
    templates: readonly DialogTemplate[];
    referencedTemplates: ReadonlySet<string>;
    disabled: boolean;
    strings: ScreenEditorStrings['properties']['dialogTemplates'];
    onChange: (templates: DialogTemplate[]) => void;
}

export const DialogTemplateListEditor = ({ templates, referencedTemplates, disabled, strings, onChange }: DialogTemplateListEditorProps) => {
    const update = (index: number, template: DialogTemplate) => onChange(templates.map((candidate, candidateIndex) => candidateIndex === index ? cleanDialogTemplate(template) : candidate));
    const remove = (index: number) => onChange(templates.filter((_, candidateIndex) => candidateIndex !== index));
    const move = (fromIndex: number, toIndex: number) => onChange(moveTemplate(templates, fromIndex, toIndex));
    const add = () => onChange([...templates, newDialogTemplate(nextTemplateName(templates, strings.newTemplateName))]);

    return (
        <section className='studio-editor-dialog-templates'>
            <strong>{strings.label}</strong>
            {templates.map((template, index) => {
                const referenced = referencedTemplates.has(template.name);
                return (
                    <fieldset key={`${template.name}:${index}`} className='studio-editor-dialog-templates__item' disabled={disabled}>
                        <legend>{template.displayName || template.name || strings.unnamed}</legend>
                        <label>
                            <span>{strings.name}</span>
                            <input value={template.name} onChange={event => update(index, { ...template, name: event.target.value })} />
                        </label>
                        <label>
                            <span>{strings.displayName}</span>
                            <input value={template.displayName ?? ''} onChange={event => update(index, { ...template, displayName: event.target.value || undefined })} />
                        </label>
                        <label>
                            <span>{strings.description}</span>
                            <input value={template.description ?? ''} onChange={event => update(index, { ...template, description: event.target.value || undefined })} />
                        </label>
                        <div className='studio-editor-dialog-templates__actions'>
                            <button type='button' disabled={index === 0} onClick={() => move(index, index - 1)}>{strings.moveUp}</button>
                            <button type='button' disabled={index === templates.length - 1} onClick={() => move(index, index + 1)}>{strings.moveDown}</button>
                            <button type='button' disabled={referenced} title={referenced ? strings.removeBlocked : undefined} onClick={() => remove(index)}>{strings.remove}</button>
                        </div>
                    </fieldset>
                );
            })}
            <button type='button' disabled={disabled} onClick={add}>{strings.add}</button>
        </section>
    );
};

function newDialogTemplate(name: string): DialogTemplate {
    return { name, slots: [{ name: 'content' }], behaviors: [] };
}

function cleanDialogTemplate(template: DialogTemplate): DialogTemplate {
    return {
        name: template.name,
        slots: template.slots.length > 0 ? template.slots : [{ name: 'content' }],
        behaviors: template.behaviors ?? [],
        ...(template.arrangement ? { arrangement: template.arrangement } : {}),
        ...(template.content ? { content: template.content } : {}),
        ...(template.displayName ? { displayName: template.displayName } : {}),
        ...(template.description ? { description: template.description } : {}),
        ...(template.metadata ? { metadata: template.metadata } : {}),
    };
}

function moveTemplate(templates: readonly DialogTemplate[], fromIndex: number, toIndex: number): DialogTemplate[] {
    const next = [...templates];
    const [template] = next.splice(fromIndex, 1);
    if (template) next.splice(toIndex, 0, template);
    return next;
}

function nextTemplateName(templates: readonly DialogTemplate[], baseName: string): string {
    const names = new Set(templates.map(template => template.name));
    if (!names.has(baseName)) return baseName;
    for (let index = 2; ; index++) {
        const name = `${baseName}${index}`;
        if (!names.has(name)) return name;
    }
}
