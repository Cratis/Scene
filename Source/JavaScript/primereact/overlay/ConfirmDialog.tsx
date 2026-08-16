// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

/**
 * Configuration for {@link ConfirmDialog}.
 */
export interface ConfirmDialogProps {
    /**
     * Whether the dialog is showing. The dialog is a controlled overlay - it never hides itself - so the
     * owner keeps this in state and lowers it from {@link ConfirmDialogProps.onHide}.
     */
    visible: boolean;

    /**
     * The question being asked. Typed as a node rather than a string so a caller can pose a question that
     * needs emphasis or a name in it, which is exactly the kind of question worth confirming.
     */
    message?: ReactNode;

    /**
     * The dialog's title.
     */
    header?: string;

    /**
     * A PrimeIcons class shown beside the message. Omitted entirely when absent rather than defaulted,
     * because the icon on a confirmation carries tone - a warning triangle on a harmless question is
     * misleading - and only the caller knows which is right.
     */
    icon?: string;

    /**
     * Label for the accepting button.
     */
    acceptLabel?: string;

    /**
     * Label for the rejecting button.
     */
    rejectLabel?: string;

    /**
     * Called when the user accepts. Always followed by {@link ConfirmDialogProps.onHide}.
     */
    onAccept?: () => void;

    /**
     * Called when the user rejects. Always followed by {@link ConfirmDialogProps.onHide}.
     */
    onReject?: () => void;

    /**
     * Called whenever the dialog should close - after either answer, and on every dismissal gesture
     * (the close button, `Escape`, a click on the backdrop). Answering and closing are reported
     * separately so a caller can lower `visible` in one place instead of in three.
     */
    onHide?: () => void;
}

/**
 * A Cratis-owned confirmation dialog - a question, an accepting answer and a rejecting one.
 *
 * This component is owned by Cratis because PrimeReact 11 removed `primereact/confirmdialog` outright.
 * There is no renamed successor to adapt to: what v11 ships instead is the compositional `Dialog` this is
 * built from, on the reasoning that a confirmation is a dialog with a known footer rather than a distinct
 * component. That is a fair reading, but it would otherwise push the same header/message/two-buttons
 * assembly into every caller, so this package assembles it once here and keeps the shape v10 callers
 * already expect.
 *
 * Two v10 capabilities are deliberately **not** carried over:
 *
 * - **The imperative `confirmDialog()` service API.** v10 let any code open a confirmation by calling a
 *   module-level function that reached a singleton mounted elsewhere. That needs a caller and a global
 *   mount point; this component is rendered and controlled by whoever owns the answer, which is the only
 *   form a Scene element - configuration, not a caller - can use anyway.
 * - **`appendTo`.** v10 needed it to escape stacking contexts. v11 renders through `Dialog.Portal` under
 *   an overlay manager that handles layering, so the prop existed only to work around a problem that is
 *   now gone.
 *
 * @param props - {@link ConfirmDialogProps}.
 */
export function ConfirmDialog({ visible, message, header, icon, acceptLabel, rejectLabel, onAccept, onReject, onHide }: ConfirmDialogProps) {
    const accept = () => {
        onAccept?.();
        onHide?.();
    };

    const reject = () => {
        onReject?.();
        onHide?.();
    };

    return (
        <Dialog.Root
            open={visible}
            modal
            dismissable
            closeOnEscape
            onOpenChange={(event) => {
                if (!event.value) onHide?.();
            }}>
            <Dialog.Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Popup style={{ width: '30rem' }}>
                        <Dialog.Header>
                            <Dialog.Title>{header}</Dialog.Title>
                            <Dialog.Close aria-label='Close'>
                                <i className='pi pi-times' />
                            </Dialog.Close>
                        </Dialog.Header>
                        <Dialog.Content>
                            <div className='flex items-center gap-3'>
                                {icon !== undefined && <i className={icon} />}
                                <span>{message}</span>
                            </div>
                        </Dialog.Content>
                        <Dialog.Footer>
                            <div className='flex justify-end gap-2'>
                                <Button variant='outlined' onClick={reject}>
                                    {rejectLabel}
                                </Button>
                                <Button onClick={accept}>{acceptLabel}</Button>
                            </div>
                        </Dialog.Footer>
                    </Dialog.Popup>
                </Dialog.Positioner>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
