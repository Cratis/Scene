// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from 'primereact/button';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';
import { ConfirmDialog } from './ConfirmDialog';

/**
 * The `PrimeReact:confirmDialog` component - a yes/no question before a consequential action.
 *
 * Adapts {@link ConfirmDialog}, which this package owns because PrimeReact 11 removed
 * `primereact/confirmdialog` and shipped no successor - see that component for what the replacement
 * deliberately leaves behind. The adapter itself is unchanged in spirit from the v10 one: it was already
 * using the declarative form rather than the imperative `confirmDialog()` call, because that call needs a
 * caller and a Scene element is configuration, not a caller. That choice is what made this the one
 * removal in the family that cost nothing at the adapter boundary.
 *
 * Visibility is owned locally for the reason described on {@link PrimeDialog}.
 *
 * A Scene element has nowhere to send an answer - there is no handler to bind to - so accepting and
 * rejecting differ only in closing the dialog. The two callbacks are still wired rather than omitted, so
 * the seam is here the moment Scene grows a way to express an action.
 */
export function PrimeConfirmDialog({ element }: RegisteredComponentProps) {
    const [visible, setVisible] = useState(false);
    return (
        <div data-scene-id={element.id}>
            <Button severity={stringProperty(element, 'severity', 'danger')} onClick={() => setVisible(true)}>
                {stringProperty(element, 'triggerLabel', 'Confirm')}
            </Button>
            <ConfirmDialog
                visible={visible}
                onHide={() => setVisible(false)}
                header={stringProperty(element, 'header', 'Are you sure?')}
                message={stringProperty(element, 'message', 'This action cannot be undone.')}
                icon={stringProperty(element, 'icon', 'pi pi-exclamation-triangle')}
                acceptLabel={stringProperty(element, 'acceptLabel', 'Yes')}
                rejectLabel={stringProperty(element, 'rejectLabel', 'No')}
            />
        </div>
    );
}
