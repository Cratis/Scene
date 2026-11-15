// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneElement } from '@cratis/scene.model';
import { outletItemsComponentName } from '@cratis/scene.engine';
import { LayoutItem } from '../Layouts/LayoutItem';
import { createExternalComponent } from '../Document/createExternalComponent';
import { createPanel } from '../Document/createPanel';

// A screen the Screenplay import made keeps what a typed Scene screen has no element for - a toolbar and its buttons, a table that opens a record when a row is
// double clicked, a data declaration that may be missing, a form - as the Screenplay text it came from, in the screen's `native` member: `native.slots[slot]` is
// a list of `{ at, text }`. The text is what the export writes back; the editor never edits it. It draws a stand-in for each, so a screen that is mostly such
// content does not open as a page with nothing on it (StudioIssues#902). The stand-ins belong to no document: they are read-only, like a template's content.
export interface NativeEntry {
    at?: number;
    text?: string;
}

interface Block {
    head: string;
    body: Block[];
}

const indentOf = (line: string): number => line.length - line.trimStart().length;

// The text as its tree of directives: a line is the head of a directive, the lines indented under it are its body.
function blocksOf(text: string): Block[] {
    const lines = text.split('\n').filter(line => line.trim().length > 0 && !line.trim().startsWith('//'));
    const root: Block = { head: '', body: [] };
    const stack: { block: Block; indent: number }[] = [{ block: root, indent: -1 }];
    for (const line of lines) {
        const indent = indentOf(line);
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
        const block: Block = { head: line.trim(), body: [] };
        stack[stack.length - 1].block.body.push(block);
        stack.push({ block, indent });
    }

    return root.body;
}

const quoted = (head: string, keyword: string): string | undefined => new RegExp(`(?:^|\\s)${keyword}\\s+"([^"]*)"`).exec(head)?.[1];
const word = (head: string, keyword: string): string | undefined => new RegExp(`(?:^|\\s)${keyword}\\s+([^\\s"]+)`).exec(head)?.[1];

const nameOf = (head: string): string => head.split(/\s+/)[1] ?? '';

// A button is named by its bare name, so the profile draws it with its own button (as a button dropped from the palette is), not Scene's unstyled core one.
const buttonComponent = 'button';

const buttonOf = (head: string, id: string): SceneElement =>
    createExternalComponent(id, nameOf(head), buttonComponent, { label: quoted(head, 'title') ?? nameOf(head), severity: word(head, 'emphasis') === 'primary' ? undefined : 'secondary' });

// A button of a toolbar, as an item of the outlet of actions the toolbar is.
const outletButtonOf = (head: string) => ({
    kind: 'button',
    id: nameOf(head),
    title: quoted(head, 'title') ?? nameOf(head),
    emphasis: word(head, 'emphasis') === 'primary' ? 'primary' : 'secondary',
    ...(word(head, 'icon') ? { icon: word(head, 'icon') } : {}),
    ...(word(head, 'slice') ? { slice: word(head, 'slice') } : {}),
});

const standInOf = (block: Block, id: string): SceneElement => {
    const keyword = block.head.split(/\s+/)[0];
    switch (keyword) {
        case 'table': {
            const columns = block.body.filter(child => child.head.startsWith('column ')).map((column, index) => {
                const property = nameOf(column.head);
                return createExternalComponent(`${id}-column-${index}`, property, 'core:column', { property, label: quoted(column.head, 'label') ?? property });
            });
            return createExternalComponent(id, `Table ${nameOf(block.head)}`, 'core:table', { typeName: nameOf(block.head) }, { columns });
        }

        case 'toolbar': {
            // A toolbar is an outlet of actions, which is how Scene 5 draws a screen's toolbar and how Play shows it: its buttons in a row, primary
            // or secondary as the screen says.
            const buttons = block.body.filter(child => child.head.startsWith('button ')).map(button => outletButtonOf(button.head));
            return createExternalComponent(id, `Toolbar ${nameOf(block.head)}`, outletItemsComponentName, { name: `native-${nameOf(block.head)}`, kind: 'actions', items: buttons });
        }

        case 'button':
            return buttonOf(block.head, id);

        case 'action': {
            // An action of a list's toolbar works on the selected row; it is drawn as the toolbar button it is.
            const title = quoted(block.head, 'action') ?? nameOf(block.head);
            return createExternalComponent(id, title, outletItemsComponentName, { name: `native-${id}`, kind: 'actions', items: [{ kind: 'button', id: `${id}-action`, title, emphasis: 'secondary' }] });
        }

        default:
            // What this does not know is still said, in the words the screen says it in, and never left out silently.
            return createExternalComponent(id, block.head, 'core:text', { text: block.head });
    }
};

/**
 * The stand-ins for what a screen keeps natively in one of its slots.
 *
 * @param entries The `native.slots[slot]` entries of the screen.
 * @param slot The slot they sit in, which keeps their ids apart from the other slots'.
 * @returns A read-only element for each directive the entries hold, in the order the entries state them.
 */
export function nativeStandIns(entries: readonly NativeEntry[] | undefined, slot: string): SceneElement[] {
    const result: SceneElement[] = [];
    (entries ?? []).forEach((entry, entryIndex) => {
        if (typeof entry?.text !== 'string') return;
        blocksOf(entry.text).forEach((block, blockIndex) => {
            const standIn = standInOf(block, `native-${slot}-${entryIndex}-${blockIndex}`);
            // A toolbar and the actions that follow it are one row of buttons, as Play draws them, not an outlet each stacked down the slot.
            const previous = result[result.length - 1] as SceneElement | undefined;
            if (previous && isActionsOutlet(previous) && isActionsOutlet(standIn)) result[result.length - 1] = withItemsOf(previous, standIn);
            else result.push(standIn);
        });
    });
    return result;
}

const isActionsOutlet = (element: SceneElement): boolean =>
    (element as { componentName?: string }).componentName === outletItemsComponentName && (element as { properties?: { kind?: unknown } }).properties?.kind === 'actions';

const withItemsOf = (into: SceneElement, from: SceneElement): SceneElement => {
    const target = into as SceneElement & { properties: Record<string, unknown> };
    const source = from as SceneElement & { properties: Record<string, unknown> };
    return { ...target, properties: { ...target.properties, items: [...(target.properties.items as unknown[]), ...(source.properties.items as unknown[])] } } as SceneElement;
};

// The form of a command a screen's action opens is kept in the screen's `forms`, not as an element on the canvas: the author edits it in the properties of the
// screen. Drawn only there, a screen whose point is a form - a dialog that creates a record, a page of actions - opens with nothing on it. The stand-in is the
// form itself: its fields with a sample value each, then the button that sends the command.
export interface FormStandInSource {
    name?: string;
    forCommand?: string;
    fields?: { name?: string; label?: string }[];
    layout?: unknown;
}

const spaced = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

/**
 * The stand-ins for the command forms of a screen.
 *
 * @param forms The `forms` of the screen.
 * @param placed The commands a form element already placed on the canvas stands for, which are not drawn twice.
 * @param sentByTheDialog Whether the screen is a dialog whose button row sends the command, so the form draws no button of its own.
 * @returns A read-only form for each command that is not placed.
 */
export function formStandIns(forms: readonly FormStandInSource[] | undefined, placed: ReadonlySet<string> = new Set(), sentByTheDialog = false): SceneElement[] {
    return (forms ?? []).filter(form => typeof form?.forCommand === 'string' && !placed.has(form.forCommand)).map((form, index) => {
        const id = `native-form-${index}`;
        const command = form.forCommand as string;
        const fields = (form.fields ?? []).filter(field => typeof field?.name === 'string').map((field, fieldIndex) =>
            createExternalComponent(`${id}-field-${fieldIndex}`, field.name as string, 'core:field', { property: field.name, label: field.label ?? field.name }));
        return createPanel(LayoutItem.Stack, id, `Form ${command}`, [
            // In a dialog the frame says what the form does (`dialogTitleOf`); on a page the form says it itself.
            ...(sentByTheDialog ? [] : [createExternalComponent(`${id}-title`, command, 'core:text', { text: spaced(command) })]),
            // The fields as the form's inputs on the grid of its layout, drawn as the preview draws them (`FormFields`).
            ...(fields.length > 0 ? [createExternalComponent(`${id}-fields`, `${command} fields`, 'core:summary', { typeName: command, form: true, ...(form.layout === undefined ? {} : { layout: form.layout }) }, { fields })] : []),
            // In a dialog the dialog's own Submit sends the command; a second button saying the same would only be a second way to send it.
            ...(sentByTheDialog ? [] : [createExternalComponent(`${id}-send`, command, buttonComponent, { label: spaced(command) })]),
        ]);
    });
}
