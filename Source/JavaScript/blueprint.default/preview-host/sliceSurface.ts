// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, SceneElement, Screen, ScreenTemplate } from '@cratis/scene.model';
import { LayoutName } from '../layouts';

/** How a slice preview presents the slice's own UI. */
export enum SliceSurface {
    /** The screen the slice owns, drawn inline in a neutral container. */
    Page = 'page',

    /** The screen the slice owns is a dialog template's: it is drawn as an opened dialog card on a neutral backdrop. */
    Dialog = 'dialog',

    /** The slice owns no screen that presents its command: the task dialog opens over a neutral backdrop, with nothing behind it. */
    TaskDialog = 'task-dialog',
}

/** The command a `core:action` or a command form element executes, when it names one. */
const commandOf = (element: SceneElement): string | undefined => {
    const properties = (element as ExternalComponent).properties as Record<string, unknown> | undefined;
    return typeof properties?.command === 'string' && properties.command !== '' ? properties.command : undefined;
};

const slotsOf = (element: SceneElement): Record<string, SceneElement[]> | undefined => (element as { slots?: Record<string, SceneElement[]> }).slots;

function everyElement(elements: readonly SceneElement[]): SceneElement[] {
    return elements.flatMap(element => {
        const node = element as { children?: SceneElement[]; content?: SceneElement; itemTemplate?: SceneElement };
        return [
            element,
            ...everyElement([
                ...Object.values(slotsOf(element) ?? {}).flat(),
                ...(Array.isArray(node.children) ? node.children : []),
                ...(node.content ? [node.content] : []),
                ...(node.itemTemplate ? [node.itemTemplate] : []),
            ]),
        ];
    });
}

const isAction = (element: SceneElement) => (element as ExternalComponent).componentName === 'core:action';
const isCommandForm = (element: SceneElement) => /(^|[:.])commandForm$/.test((element as ExternalComponent).componentName ?? '');

/**
 * The screen on the chrome-less full-page layout: no root template, no navigation regions, no feature page - the neutral container a slice is
 * previewed in. The screen's own content and template are untouched.
 *
 * @param screen The screen a slice owns.
 * @returns The screen on the full-page layout.
 */
export function onNeutralSurface(screen: Screen): Screen {
    return screen.layout === LayoutName.FullPage ? screen : { ...screen, layout: LayoutName.FullPage };
}

/**
 * Whether the screens present the command to the person: one hosts a form for it, one of its elements is an action that executes it, or one places a
 * command form for it. A slice whose screens do none of these has its task dialog opened instead, so the command is presented once either way.
 *
 * @param screens The screens the slice owns.
 * @param command The command the slice accepts.
 * @returns True when a screen presents the command.
 */
export function presentsCommand(screens: readonly Screen[], command: string): boolean {
    return screens.some(screen =>
        screen.forms.some(form => form.forCommand === command)
        || everyElement(Object.values(screen.slotContent).flat()).some(element => (isAction(element) || isCommandForm(element)) && commandOf(element) === command));
}

/**
 * Whether the screen is drawn from a dialog template - one whose metadata says it is a dialog (`QuickCreateDialog`, `ConfirmDialog`, ...).
 *
 * @param screen The screen.
 * @param templates The templates the screen's template is looked up in.
 * @returns True when the screen's template is a dialog template.
 */
export function isDialogScreen(screen: Screen, templates: readonly ScreenTemplate[]): boolean {
    return screen.screenTemplate !== undefined && templates.find(template => template.name === screen.screenTemplate)?.metadata?.type === 'Dialog';
}

/** The screen without the actions that are the submit of a form it hosts, and the label each of them carried. */
export interface WithoutFormSubmits {
    screen: Screen;

    /** The label of the removed action, by the command it executed; a command whose action had no label is not in it. */
    labels: Record<string, string>;
}

/**
 * An action that executes the command of a form the same screen hosts is that form's submit: drawn as well, the command would be offered twice - a
 * button and a form with a button of its own. The action is left out and the form's submit carries its label.
 *
 * @param screen The screen a slice owns.
 * @returns The screen without those actions, and their labels by command.
 */
export function withoutFormSubmits(screen: Screen): WithoutFormSubmits {
    const hosted = new Set(screen.forms.map(form => form.forCommand));
    const labels: Record<string, string> = {};
    if (hosted.size === 0) return { screen, labels };

    const strip = (elements: SceneElement[]): SceneElement[] => elements
        .filter(element => {
            const command = commandOf(element);
            if (!isAction(element) || command === undefined || !hosted.has(command)) return true;
            const label = ((element as ExternalComponent).properties as Record<string, unknown>).label;
            if (typeof label === 'string' && label !== '' && labels[command] === undefined) labels[command] = label;
            return false;
        })
        .map(element => {
            const slots = slotsOf(element);
            return slots === undefined ? element : { ...element, slots: Object.fromEntries(Object.entries(slots).map(([name, content]) => [name, strip(content)])) } as SceneElement;
        });

    return { screen: { ...screen, slotContent: Object.fromEntries(Object.entries(screen.slotContent).map(([slot, content]) => [slot, strip(content)])) }, labels };
}
