// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate } from '@cratis/scene.model';
import { TemplateSlotName } from '@cratis/scene.blueprint.default';
import { busyIndicatorDialog, commandDialog, dialog } from './dialogElements';
import { icon } from './elements';
import { calendarField, inputTextField, numberField, textAreaField } from './formElements';
import { SampleBindingName } from './SampleBindingName';

/**
 * The three dialog shapes an Arc application repeats: submit a command, confirm something destructive, and
 * say that something long-running is in flight.
 *
 * A dialog template has no `fitsSlot`, and that absence is the whole distinction from a screen template. A
 * screen template is *placed* - it fills a slot on whatever contains it, and the containment chain decides
 * where it appears. A dialog is *summoned*: it opens over the application from wherever the code that
 * opened it happens to be, so there is no parent slot for it to name.
 *
 * Every one of these declares exactly one slot, which is a real departure from how the default blueprint
 * builds its dialogs, and the reason is worth stating. The default blueprint composes a dialog out of
 * primitives - a title, a message, a row of buttons - because primitives are all it has. Here the library
 * ships whole dialogs that resolve their result through Arc's dialog context, so the frame, the title bar
 * and the buttons all belong to the composite. A template that declared `header` and `actions` slots would
 * be offering regions that render *outside* the modal, which is worse than not offering them: a screen
 * would fill them, and the content would appear somewhere nobody expected.
 */

/**
 * A command dialog: a short capture whose confirm button is the command's execution.
 *
 * Worth reaching for instead of composing `dialog` with `commandForm`, because a hand-composed pair has no
 * way to keep the dialog open on a rejected command without reimplementing the protocol. This one submits,
 * feeds the backend's validation results back onto the fields, and only closes when the command succeeded.
 *
 * The fields are placed by hand rather than generated, which is the opposite choice from `CommandFormPage`
 * and deliberate. A dialog is a *short* capture: three or four properties chosen because they are the ones
 * a person can answer in an overlay. Generating every property of the command would turn an overlay into a
 * page, which is precisely the decision a dialog is supposed to have already made.
 */
export const commandDialogTemplate: DialogTemplate = {
    name: 'CommandDialog',
    slots: [{ name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Body]: [
            commandDialog('command-dialog', SampleBindingName.RecordAdjustment, 'Record an adjustment', 'Record', [
                numberField('command-dialog-amount', 'amount', 'Amount'),
                inputTextField('command-dialog-reason', 'reason', 'Reason', 'Damaged goods'),
                calendarField('command-dialog-effective', 'effective', 'Effective from'),
                textAreaField('command-dialog-note', 'note', 'Note', 3),
            ]),
        ],
    },
    displayName: 'Command dialog',
    description: 'A short capture whose confirm button submits the command and only closes when it succeeded.',
};

/**
 * A confirmation dialog: one question, the consequence spelled out, and a way back.
 *
 * The Arc-aware `dialog` rather than PrimeReact's, because a caller `await`s a `DialogResult` from it
 * instead of threading `visible` state and callbacks by hand - which is the difference between a
 * confirmation you can call from a handler and one you have to wire into a component's state.
 *
 * The confirm label says what will happen rather than `OK`. A confirmation whose buttons are `OK` and
 * `Cancel` makes the reader map the question onto the answer under time pressure, which is exactly when
 * they will get it wrong.
 */
export const confirmDialogTemplate: DialogTemplate = {
    name: 'ConfirmDialog',
    slots: [{ name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Body]: [
            dialog('confirm-dialog', 'Void this invoice?', 'Void it', 'Keep it', [
                icon('confirm-dialog-icon', 'pi pi-exclamation-triangle'),
                inputTextField('confirm-dialog-reason', 'reason', 'Why is it being voided?', 'Duplicate of INV-2041'),
            ]),
        ],
    },
    displayName: 'Confirmation dialog',
    description: 'One question with the consequence spelled out, answered through Arc dialog context.',
};

/**
 * A busy dialog: the blocking spinner shown while a long-running command is in flight.
 *
 * In a running application the Arc dialog host renders this, threading its own title and message through.
 * Shipping it as a template is what lets its wording be *designed* rather than discovered the first time an
 * operation takes a while - which is the only moment anyone ever sees it, and the worst possible moment to
 * be reading a sentence nobody wrote on purpose.
 */
export const busyDialogTemplate: DialogTemplate = {
    name: 'BusyDialog',
    slots: [{ name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Body]: [
            busyIndicatorDialog('busy-dialog', 'Recording the adjustment', 'The invoice will reappear as soon as the read model catches up.'),
        ],
    },
    displayName: 'Busy dialog',
    description: 'The blocking spinner shown while a long-running command is in flight, with wording chosen up front.',
};

/** The dialog templates this blueprint provides. */
export const componentsDialogTemplates: DialogTemplate[] = [commandDialogTemplate, confirmDialogTemplate, busyDialogTemplate];
