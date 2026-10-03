// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';
import { QuillLoaderContext } from './QuillLoaderContext';
import { htmlToPlainText } from './htmlToPlainText';
import { renderSafeNodes } from './renderSafeNodes';
import { sanitizeHtml } from './sanitizeHtml';
import { useQuillEditor } from './useQuillEditor';

/**
 * The `PrimeReact:editor` rich-text control.
 *
 * Authored HTML is untrusted data and is never injected as markup. Everywhere it is shown it first goes
 * through an allowlist (see {@link sanitizeHtml}): into Quill as a Delta, or into the read-only view as React
 * elements. Where there is no DOM - server rendering, and the first client render so hydration matches - it is
 * shown as plain text. `element.properties.value` itself is never changed.
 *
 * Editing needs Quill, which this package does not import. A host provides it with `QuillLoaderProvider`
 * (the loader `loadQuill` lives in the `@cratis/scene.primereact/quill` entry point). Without a loader, or if
 * loading fails, the content stays visible read-only and a status says why; the control never pretends to be
 * editable.
 *
 * `readOnly: true` and `isEnabled: false` both stop editing. Edits are runtime state: `interactions.onChange`
 * is called when the user edits, but the new HTML is not written back to the document or a binding.
 */
export function PrimeEditor({ element, interactions }: RegisteredComponentProps) {
    const loader = useContext(QuillLoaderContext);
    const host = useRef<HTMLDivElement>(null);
    const interactionReference = useRef(interactions);
    interactionReference.current = interactions;
    const [mounted, setMounted] = useState(false);
    const html = stringProperty(element, 'value', '');
    const readOnly = booleanProperty(element, 'readOnly', false);
    const editable = !readOnly && element.isEnabled;
    const ariaLabel = stringProperty(element, 'ariaLabel', 'Rich text editor');

    useEffect(() => setMounted(true), []);

    const editor = useQuillEditor({
        loader,
        host,
        html,
        showHeader: booleanProperty(element, 'showHeader', true),
        editable,
        placeholder: stringProperty(element, 'placeholder'),
        ariaLabel,
        onUserChange: () => interactionReference.current?.onChange?.(),
    });

    const readOnlyView = useMemo(() => {
        if (!mounted || typeof DOMParser === 'undefined') return htmlToPlainText(html);
        return renderSafeNodes(sanitizeHtml(html));
    }, [mounted, html]);

    const status = !editor.ready ? undefined : editable ? `${editor.characters} characters` : readOnly ? 'Read only' : 'Disabled';

    return (
        <section data-scene-id={element.id} data-scene-component='editor' onClick={interactions?.onClick} onDoubleClick={interactions?.onDoubleClick}>
            <div ref={host} />
            {!editor.ready && (
                <div
                    key={typeof readOnlyView}
                    role='textbox'
                    tabIndex={0}
                    aria-multiline='true'
                    aria-readonly='true'
                    aria-label={ariaLabel}
                    data-scene-part='read-only-content'
                    style={typeof readOnlyView === 'string' ? { whiteSpace: 'pre-wrap' } : undefined}>
                    {readOnlyView}
                </div>
            )}
            {editor.failure !== undefined && <p role='alert' data-scene-state='unavailable'>{`Rich-text editing could not be loaded: ${editor.failure}`}</p>}
            {!editor.ready && editor.failure === undefined && loader === undefined && (
                <p role='status' data-scene-state='read-only'>Rich-text editing is not available in this application. The content is shown read-only.</p>
            )}
            {status !== undefined && <output aria-live='polite'>{status}</output>}
        </section>
    );
}
