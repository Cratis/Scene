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
 *
 * PrimeReact 11 made `Dialog` compositional, which turns that local visibility into a two-way
 * arrangement: `open` pushes the state down, and every dismissal gesture - the close button, `Escape`, a
 * click on the backdrop - comes back as `onOpenChange`. Both have to be wired, because a v11 dialog never
 * hides itself; ignoring the callback would leave a dialog that opens once and can never be closed.
 *
 * The parts are assembled here rather than by the component: `Dialog.Portal` and `Dialog.Backdrop` are
 * what make it modal, and `Dialog.Close` is the only reason the header gets an X.
 *
 * **Not available in v11:** the headless dialog has no resize handle, so a dialog cannot be made
 * user-resizable. No Scene property is lost to this - this adapter never exposed one - but `draggable`,
 * which v11 does still support, is the only direct-manipulation affordance left.
 */
export function PrimeDialog({ element, slots }: RegisteredComponentProps) {
    const [visible, setVisible] = useState(booleanProperty(element, 'visible', false));
    const header = stringProperty(element, 'header', 'Dialog');
    return (
        <div data-scene-id={element.id}>
            <Button onClick={() => setVisible(true)}>{stringProperty(element, 'triggerLabel', header)}</Button>
            <Dialog.Root
                open={visible}
                modal={booleanProperty(element, 'modal', true)}
                draggable={booleanProperty(element, 'draggable', false)}
                dismissable
                closeOnEscape
                onOpenChange={(event) => {
                    if (!event.value) setVisible(false);
                }}>
                <Dialog.Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Popup style={{ width: stringProperty(element, 'width', '32rem') }}>
                            <Dialog.Header>
                                <Dialog.Title>{header}</Dialog.Title>
                                <Dialog.Close aria-label='Close'>
                                    <i className='pi pi-times' />
                                </Dialog.Close>
                            </Dialog.Header>
                            <Dialog.Content>{slots.content}</Dialog.Content>
                        </Dialog.Popup>
                    </Dialog.Positioner>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
