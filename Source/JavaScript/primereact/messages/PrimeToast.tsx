// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Toaster, toast, useToasterContext } from 'primereact/toaster';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringProperty } from '../properties';

/**
 * Renders whatever notifications are currently queued for the surrounding toaster.
 *
 * PrimeReact 11 splits a toast in two: a `Toaster` owns the queue, the position and the timers, and the
 * caller decides what one notification looks like. Nothing renders until someone maps the queue, which is
 * what this does - it has to be its own component because reading the queue means reading the toaster's
 * context, and that context is only available below the `Toaster.Root` that provides it.
 *
 * The severity icons are chosen here rather than left out because `Toast.Icon` renders only when its
 * `match` equals the toast's severity, so the four are alternatives, not four icons at once.
 */
function ToastList() {
    const toaster = useToasterContext();
    if (toaster === undefined) return null;

    return (
        <>
            {toaster.toasts.map((item) => (
                <Toast.Root key={item.id} toast={item}>
                    <Toast.Icon match='success'>
                        <i className='pi pi-check-circle' aria-hidden='true' />
                    </Toast.Icon>
                    <Toast.Icon match='info'>
                        <i className='pi pi-info-circle' aria-hidden='true' />
                    </Toast.Icon>
                    <Toast.Icon match='warn'>
                        <i className='pi pi-exclamation-triangle' aria-hidden='true' />
                    </Toast.Icon>
                    <Toast.Icon match='error'>
                        <i className='pi pi-times-circle' aria-hidden='true' />
                    </Toast.Icon>
                    <Toast.Content>
                        <Toast.Title />
                        <Toast.Description />
                    </Toast.Content>
                    <Toast.Close aria-label='Dismiss'>
                        <i className='pi pi-times' aria-hidden='true' />
                    </Toast.Close>
                </Toast.Root>
            ))}
        </>
    );
}

/**
 * The `PrimeReact:toast` component - a transient notification in a corner of the screen.
 *
 * A toast is purely imperative: nothing renders until someone announces something. A Scene element cannot
 * make that call, so the adapter makes it once on mount from the element's own properties. The element
 * therefore reads as "this screen announces this" rather than as a component that happens to render
 * nothing, which is what a literal wrapper would produce.
 *
 * PrimeReact 11 replaced v10's per-component ref and `show()` with a module-level queue and a free
 * `toast()` function - a better arrangement for an application, since anything can announce without
 * holding a ref, but a shared one. The element's own id is used as the toast's group so this toaster shows
 * only what this element announced, and the announcement is withdrawn on unmount; without both, several
 * `toast` elements on one screen would each show all of each other's notifications and leave them behind.
 *
 * `data-scene-id` sits on a wrapper rather than on the toaster, because the toaster renders through a
 * portal to the end of the document: the identifying attribute would leave the position in the tree where
 * the element was actually authored, which is where a design-time tool looks for it.
 */
export function PrimeToast({ element }: RegisteredComponentProps) {
    const authored = stringProperty(element, 'severity', 'info');
    const severity = authored === 'warning' ? 'warn' : authored;
    const summary = stringProperty(element, 'summary', '');
    const detail = stringProperty(element, 'detail', '');
    const life = numberProperty(element, 'life', 3000);
    const group = element.id;

    useEffect(() => {
        const id = toast({
            group,
            severity: severity as 'success' | 'info' | 'warn' | 'error',
            title: summary,
            description: detail,
            duration: life,
        });
        return () => toast.dismiss(id);
    }, [group, severity, summary, detail, life]);

    return (
        <div data-scene-id={element.id}>
            <Toaster.Root
                group={group}
                timeout={life}
                position={stringProperty(element, 'position', 'top-right') as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' | 'center'}>
                <Toaster.Portal>
                    <Toaster.Region>
                        <ToastList />
                    </Toaster.Region>
                </Toaster.Portal>
            </Toaster.Root>
        </div>
    );
}
