// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from '@cratis/components/Common';
import { Dialog, DialogInitialFocus } from '@cratis/components/Dialogs';
import { TemplateBrowserContent, type TemplateBrowserContentProps } from './TemplateBrowserContent';
import './TemplateBrowser.css';

export interface TemplateBrowserProps extends TemplateBrowserContentProps {
    /** Whether the dialog is open. */
    visible: boolean;

    /** Closes the dialog. */
    onClose: () => void;
}

/**
 * The template browser as a dialog, opened from a picker's "Browse all…" (spec 6). It is the same body as the page of the Screen Templates node, in
 * pick mode: only what fits the target is listed, choosing closes it, and Escape or Close leaves the choice as it was.
 *
 * Focus moves in on open, stays inside and returns to the control that opened it.
 */
export function TemplateBrowser({ visible, onClose, ...content }: TemplateBrowserProps) {
    const choose = content.actions.onChoose;
    const actions = choose === undefined ? content.actions : { ...content.actions, onChoose: (entry: Parameters<NonNullable<typeof choose>>[0]) => { choose(entry); onClose(); } };

    return (
        <Dialog
            title={content.strings.title}
            visible={visible}
            width='min(80rem, 100vw)'
            dismissable
            initialFocus={DialogInitialFocus.Content}
            closeAriaLabel={content.strings.actions.close}
            className='studio-template-browser-dialog'
            onClose={onClose}
            buttons={<Button label={content.strings.actions.close} onClick={onClose} />}>
            <TemplateBrowserContent {...content} actions={actions} />
        </Dialog>
    );
}
