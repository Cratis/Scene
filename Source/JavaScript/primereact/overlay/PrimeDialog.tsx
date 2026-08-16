// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:dialog` component - a modal window.
 *
 * A dialog is only ever interesting while it is open, and "the user closed it" is state a Scene element
 * has no place to record. The adapter therefore owns visibility locally, seeded from the `visible`
 * property, and always renders a trigger button beside it. That keeps a dialog reachable again after it
 * is dismissed - without the trigger, closing a previewed dialog would leave a permanently blank spot on
 * the screen with no way back.
 */
export function PrimeDialog({ element, slots }: RegisteredComponentProps) {
    const [visible, setVisible] = useState(booleanProperty(element, 'visible', false));
    const header = stringProperty(element, 'header', 'Dialog');
    return (
        <div data-scene-id={element.id}>
            <Button label={stringProperty(element, 'triggerLabel', header)} onClick={() => setVisible(true)} />
            <Dialog
                header={header}
                visible={visible}
                onHide={() => setVisible(false)}
                modal={booleanProperty(element, 'modal', true)}
                draggable={booleanProperty(element, 'draggable', false)}
                style={{ width: stringProperty(element, 'width', '32rem') }}>
                {slots.content}
            </Dialog>
        </div>
    );
}
