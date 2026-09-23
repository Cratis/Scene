// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction, InteractionActionKind, NotificationLevel } from '@cratis/scene.model';
import { InteractionStop, runActions } from '../runActions';
import { pathEchoingContext, RecordingDispatcher } from './given/a_recording_dispatcher';

const action = (kind: InteractionActionKind, extra: Record<string, unknown> = {}): InteractionAction =>
    ({ kind, ...extra }) as InteractionAction;

describe('when running a sequence of actions', () => {
    it('should run them in the order they were declared', async () => {
        const dispatcher = new RecordingDispatcher();

        await runActions(
            [
                action(InteractionActionKind.RefreshQuery, { query: 'Invoices' }),
                action(InteractionActionKind.Notify, { level: NotificationLevel.Info, message: { text: 'Done' } }),
            ],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.eql(['refreshQuery:Invoices', 'notify:Info:Done']);
    });

    it('should resolve an action\'s arguments through the binding resolver', async () => {
        const dispatcher = new RecordingDispatcher();

        await runActions(
            [
                action(InteractionActionKind.ExecuteCommand, {
                    command: 'CancelInvoice',
                    arguments: [{ name: 'invoiceId', value: { path: 'item.invoiceId' } }],
                }),
            ],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.eql(['executeCommand:CancelInvoice:{"invoiceId":"<item.invoiceId>"}']);
    });

    it('should take the success branch when a command succeeds', async () => {
        const dispatcher = new RecordingDispatcher();

        const run = await runActions(
            [
                action(InteractionActionKind.ExecuteCommand, {
                    command: 'RegisterInvoice',
                    onSuccess: [action(InteractionActionKind.CloseDialog)],
                    onFailure: [action(InteractionActionKind.Notify, { level: NotificationLevel.Error, message: { text: 'Failed' } })],
                }),
            ],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.eql(['executeCommand:RegisterInvoice:{}', 'closeDialog']);
        run.stop.should.equal(InteractionStop.Completed);
    });

    it('should take the failure branch when a command fails', async () => {
        const dispatcher = new RecordingDispatcher();
        dispatcher.commandSucceeds = false;

        await runActions(
            [
                action(InteractionActionKind.ExecuteCommand, {
                    command: 'RegisterInvoice',
                    onSuccess: [action(InteractionActionKind.CloseDialog)],
                    onFailure: [action(InteractionActionKind.Notify, { level: NotificationLevel.Error, message: { text: 'Failed' } })],
                }),
            ],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.eql(['executeCommand:RegisterInvoice:{}', 'notify:Error:Failed']);
    });

    // A confirm exists to gate what follows it. If a decline let the rest run, the gate would be decorative.
    it('should stop the sequence when a confirm is declined', async () => {
        const dispatcher = new RecordingDispatcher();
        dispatcher.confirmAnswer = false;

        const run = await runActions(
            [
                action(InteractionActionKind.Confirm, {
                    message: { text: 'Are you sure?' },
                    onSuccess: [action(InteractionActionKind.ExecuteCommand, { command: 'CancelInvoice' })],
                }),
                action(InteractionActionKind.Notify, { level: NotificationLevel.Info, message: { text: 'Cancelled' } }),
            ],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.eql(['confirm:Are you sure?']);
        run.stop.should.equal(InteractionStop.Declined);
    });

    it('should run the gated actions when a confirm is accepted', async () => {
        const dispatcher = new RecordingDispatcher();

        await runActions(
            [
                action(InteractionActionKind.Confirm, {
                    message: { text: 'Are you sure?' },
                    onSuccess: [action(InteractionActionKind.ExecuteCommand, { command: 'CancelInvoice' })],
                }),
            ],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.eql(['confirm:Are you sure?', 'executeCommand:CancelInvoice:{}']);
    });

    // The screen the remaining actions were written for is gone. The compiler reports this as unreachable, so
    // reaching it at runtime means the document changed underneath - still not a reason to run them.
    it('should stop the sequence after a navigation', async () => {
        const dispatcher = new RecordingDispatcher();

        const run = await runActions(
            [
                action(InteractionActionKind.Navigate, { screen: 'InvoiceList' }),
                action(InteractionActionKind.Notify, { level: NotificationLevel.Info, message: { text: 'Never runs' } }),
            ],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.eql(['navigate:InvoiceList']);
        run.stop.should.equal(InteractionStop.Navigated);
    });

    it('should stop the sequence after navigating back', async () => {
        const dispatcher = new RecordingDispatcher();

        const run = await runActions(
            [action(InteractionActionKind.NavigateBack), action(InteractionActionKind.CloseDialog)],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.eql(['navigateBack']);
        run.stop.should.equal(InteractionStop.Navigated);
    });

    it('should run a dialog\'s result continuation after it closes', async () => {
        const dispatcher = new RecordingDispatcher();

        await runActions(
            [
                action(InteractionActionKind.OpenDialog, {
                    dialogTemplate: 'InvoiceDetails',
                    arguments: [{ name: 'invoiceId', value: { path: 'item.invoiceId' } }],
                    onResult: [action(InteractionActionKind.RefreshQuery, { query: 'Invoices' })],
                }),
            ],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.eql([
            'openDialog:InvoiceDetails:{"invoiceId":"<item.invoiceId>"}',
            'refreshQuery:Invoices',
        ]);
    });

    it('should resolve a message from a binding when it has one', async () => {
        const dispatcher = new RecordingDispatcher();

        await runActions(
            [action(InteractionActionKind.Notify, { level: NotificationLevel.Info, message: { binding: { path: 'state.message' } } })],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.eql(['notify:Info:<state.message>']);
    });

    it('should localize a message given a strings key', async () => {
        const dispatcher = new RecordingDispatcher();

        await runActions(
            [action(InteractionActionKind.Notify, { level: NotificationLevel.Info, message: { stringsKey: 'invoiceRegistered' } })],
            dispatcher,
            { resolve: () => undefined, localize: key => `localized(${key})` }
        );

        dispatcher.calls.should.eql(['notify:Info:localized(invoiceRegistered)']);
    });

    // Fail closed and visible: an action kind this engine does not know is reported, and the rest of the
    // sequence is abandoned rather than half-applied silently.
    it('should report an action kind it does not know instead of ignoring it', async () => {
        const dispatcher = new RecordingDispatcher();

        const run = await runActions(
            [action('SomethingFromALaterVersion' as InteractionActionKind)],
            dispatcher,
            pathEchoingContext
        );

        dispatcher.calls.should.be.empty;
        run.stop.should.equal(InteractionStop.Reported);
        run.findings.should.have.lengthOf(1);
        run.findings[0].kind.should.equal('unknownAction');
        run.findings[0].detail.should.contain('SomethingFromALaterVersion');
    });

    it('should report a message binding that resolved to nothing', async () => {
        const dispatcher = new RecordingDispatcher();

        const run = await runActions(
            [action(InteractionActionKind.Confirm, { message: { binding: { path: 'state.missing' } } })],
            dispatcher,
            { resolve: () => undefined }
        );

        run.findings[0].kind.should.equal('unresolvedMessage');
        run.findings[0].detail.should.contain('state.missing');
    });
});
