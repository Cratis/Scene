// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef, useState } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:editor` rich-text control.
 *
 * Quill is loaded only after a browser-side mount, because it owns a browser document. Hosts opt into it
 * through the optional `quill` peer dependency; server rendering still exposes the authored HTML instead
 * of importing a DOM-only library.
 */
export function PrimeEditor({ element, interactions }: RegisteredComponentProps) {
    const host = useRef<HTMLDivElement>(null);
    const authoredValue = stringProperty(element, 'value', '');
    const [value, setValue] = useState(authoredValue);
    const [mounted, setMounted] = useState(false);
    const [ready, setReady] = useState(false);
    const [unavailable, setUnavailable] = useState(false);
    const interactionReference = useRef(interactions);
    const ariaLabel = stringProperty(element, 'ariaLabel', 'Rich text editor');
    const readOnly = booleanProperty(element, 'readOnly', false);
    const showHeader = booleanProperty(element, 'showHeader', true);
    interactionReference.current = interactions;

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!mounted || host.current === null) return;

        let active = true;
        let editor: { root: HTMLElement; on(event: string, listener: () => void): void } | undefined;
        void import('quill').then(module => {
            if (!active || host.current === null) return;
            host.current.replaceChildren();
            editor = new module.default(host.current, {
                modules: { toolbar: showHeader ? [['bold', 'italic', 'underline'], [{ header: [1, 2, 3, false] }], [{ list: 'ordered' }, { list: 'bullet' }], ['link']] : false },
                placeholder: stringProperty(element, 'placeholder'),
                readOnly,
                theme: 'snow',
            });
            editor.root.innerHTML = authoredValue;
            editor.root.setAttribute('aria-label', ariaLabel);
            editor.root.setAttribute('aria-readonly', String(readOnly));
            setReady(true);
            editor.on('text-change', () => {
                const updated = editor?.root.innerHTML ?? '';
                setValue(updated);
                interactionReference.current?.onChange?.();
            });
        }).catch(() => {
            if (active) setUnavailable(true);
        });

        return () => { active = false; };
    }, [mounted, element.id, authoredValue, ariaLabel, element.properties, readOnly, showHeader]);

    return (
        <section data-scene-id={element.id} onClick={interactions?.onClick} onDoubleClick={interactions?.onDoubleClick}>
            <div ref={host} dangerouslySetInnerHTML={ready ? undefined : { __html: authoredValue }} />
            {unavailable && <p role='status'>Rich-text editing requires the optional Quill peer dependency; authored HTML remains available.</p>}
            <output aria-live='polite'>{readOnly ? 'Read only' : `${value.length} characters`}</output>
        </section>
    );
}
