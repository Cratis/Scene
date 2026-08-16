// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { externalComponent } from '@cratis/scene.blueprint.default';
import { CompositeName } from '../CompositeName';

/**
 * The dialog elements this blueprint's dialog templates are built from.
 *
 * Each is a whole dialog rather than a piece of one, and that is why this package's dialog templates look
 * so different from the default blueprint's. The default blueprint composes a dialog out of primitives - a
 * title, a message, a row of buttons - because it has nothing better available. Here the library ships
 * dialogs that resolve their result through Arc's dialog context, so the frame, the buttons and the
 * protocol behind them all belong to the composite. A template's job is to configure one, not to rebuild it.
 */

/**
 * The Arc-aware dialog: a frame whose result resolves through Arc's dialog context.
 *
 * Worth shadowing PrimeReact's `dialog` for. PrimeReact's is a modal frame and nothing more; this one lets
 * a caller `await` a `DialogResult` instead of threading `visible` state and callbacks by hand, which is
 * the difference between a dialog you can call and a dialog you have to wire.
 *
 * `visible` is left at the adapter's default of `true`, because a dialog placed in a template is placed to
 * be seen; a host that drives visibility sets the property itself.
 */
export function dialog(id: string, title: string, okLabel: string, cancelLabel: string, content: SceneElement[]): SceneElement {
    return externalComponent(id, CompositeName.Dialog, { title, okLabel, cancelLabel, width: '28rem' }, { content });
}

/**
 * A dialog whose confirm button *is* the command's execution.
 *
 * Worth using instead of composing `dialog` with `commandForm`, because a hand-composed pair has no way to
 * keep the dialog open on a rejected command without reimplementing the protocol: this one submits, feeds
 * the backend's validation results back onto the fields, and only closes when the command succeeded.
 */
export function commandDialog(id: string, command: string, title: string, okLabel: string, fields: SceneElement[]): SceneElement {
    return externalComponent(id, CompositeName.CommandDialog, { command, title, okLabel, cancelLabel: 'Cancel', width: '32rem' }, { content: fields });
}

/**
 * The blocking spinner shown while a long-running command is in flight.
 *
 * In a running application it is the Arc dialog host that renders this, threading its own title and
 * message through. Shipping it as a template is what lets its wording and placement be *designed* rather
 * than discovered the first time an operation takes a while - which is the only moment anyone ever sees it,
 * and the worst moment to be reading a sentence nobody wrote on purpose.
 */
export function busyIndicatorDialog(id: string, title: string, message: string): SceneElement {
    return externalComponent(id, CompositeName.BusyIndicatorDialog, { title, message });
}
