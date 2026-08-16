// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:toast` component - a transient notification in a corner of the screen.
 *
 * Toast is purely imperative: it renders nothing until someone calls `show`. A Scene element cannot make
 * that call, so the adapter makes it once on mount from the element's own properties. The element
 * therefore reads as "this screen announces this" rather than as a component that happens to render
 * nothing, which is what a literal wrapper would produce.
 */
export function PrimeToast({ element }: RegisteredComponentProps) {
    const toast = useRef<Toast>(null);
    const severity = stringProperty(element, 'severity', 'info') as 'success' | 'info' | 'warn' | 'error';
    const summary = stringProperty(element, 'summary', '');
    const detail = stringProperty(element, 'detail', '');
    const life = numberProperty(element, 'life', 3000);

    useEffect(() => {
        toast.current?.show({ severity, summary, detail, life });
    }, [severity, summary, detail, life]);

    return <Toast ref={toast} data-scene-id={element.id} position={stringProperty(element, 'position', 'top-right') as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' | 'center'} />;
}
