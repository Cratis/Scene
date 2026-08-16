// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:confirmDialog` component - a yes/no question before a consequential action.
 *
 * Uses ConfirmDialog's declarative form rather than the imperative `confirmDialog()` call, because the
 * imperative one needs a caller and a Scene element is configuration, not a caller. Visibility is owned
 * locally for the reason described on {@link PrimeDialog}.
 *
 * In PrimeReact 11 the sibling `ConfirmPopup` is removed; `ConfirmDialog` remains.
 */
export function PrimeConfirmDialog({ element }: RegisteredComponentProps) {
    const [visible, setVisible] = useState(false);
    return (
        <div data-scene-id={element.id}>
            <Button
                label={stringProperty(element, 'triggerLabel', 'Confirm')}
                severity={stringProperty(element, 'severity', 'danger') as 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help'}
                onClick={() => setVisible(true)}
            />
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
