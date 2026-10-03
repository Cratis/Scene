// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef, useState } from 'react';
import { QuillConstructor } from './QuillConstructor';
import { QuillEditorOptions } from './QuillEditorOptions';
import { QuillEditorState } from './QuillEditorState';
import { QuillInstance } from './QuillInstance';
import { applyHtml } from './applyHtml';
import { characterCount } from './characterCount';
import { toolbarLayout } from './toolbarLayout';

const idle: QuillEditorState = { ready: false, failure: undefined, characters: 0 };

/**
 * Builds and owns a Quill editor inside an element React leaves alone.
 *
 * The editor is constructed once per loader and toolbar setting, in a container this hook creates and
 * removes itself. React renders the host with no children, so a re-render can never wipe what Quill built -
 * the failure of rendering the authored HTML as the host's children and then letting Quill take it over.
 *
 * Everything else is applied to the live editor without rebuilding it:
 * - a changed `html` replaces the content silently, and only when the authored value really changed, so a
 *   user's edit survives an unrelated property change;
 * - `editable`, the placeholder and the accessible name update in place;
 * - the `text-change` listener is removed, and the toolbar and surface with the container, when the editor
 *   is rebuilt or the control unmounts.
 *
 * Only a user edit calls `onUserChange`.
 */
export function useQuillEditor(options: QuillEditorOptions): QuillEditorState {
    const { loader, host, html, showHeader, editable, placeholder, ariaLabel } = options;
    const [state, setState] = useState<QuillEditorState>(idle);
    const quillReference = useRef<QuillInstance | undefined>(undefined);
    const appliedHtml = useRef(html);
    const latest = useRef(options);
    latest.current = options;

    useEffect(() => {
        const container = host.current;
        if (loader === undefined || container === null) return undefined;

        let disposed = false;
        let dispose: (() => void) | undefined;

        loader().then(loaded => {
            if (disposed) return;
            const Quill: QuillConstructor = typeof loaded === 'function' ? loaded : loaded.default;
            const surface = container.ownerDocument.createElement('div');
            container.appendChild(surface);
            const quill = new Quill(surface, {
                theme: 'snow',
                modules: { toolbar: showHeader ? toolbarLayout : false },
                placeholder: latest.current.placeholder,
                readOnly: !latest.current.editable,
            });

            applyHtml(quill, latest.current.html);
            appliedHtml.current = latest.current.html;
            const changed = (_delta: unknown, _previous: unknown, source: string) => {
                if (source === 'silent') return;
                setState(current => ({ ...current, characters: characterCount(quill) }));
                if (source === 'user') latest.current.onUserChange();
            };

            quill.on('text-change', changed);
            quillReference.current = quill;
            dispose = () => {
                quill.off('text-change', changed);
                quillReference.current = undefined;
                container.replaceChildren();
            };
            setState({ ready: true, failure: undefined, characters: characterCount(quill) });
        }).catch((error: unknown) => {
            if (!disposed) setState({ ...idle, failure: error instanceof Error ? error.message : String(error) });
        });

        return () => {
            disposed = true;
            dispose?.();
            setState(idle);
        };
    }, [loader, host, showHeader]);

    useEffect(() => {
        const quill = quillReference.current;
        if (!state.ready || quill === undefined || html === appliedHtml.current) return;
        appliedHtml.current = html;
        applyHtml(quill, html);
        setState(current => ({ ...current, characters: characterCount(quill) }));
    }, [html, state.ready]);

    useEffect(() => {
        const quill = quillReference.current;
        if (!state.ready || quill === undefined) return;
        quill.enable(editable);
        quill.root.setAttribute('aria-readonly', String(!editable));
        const toolbar = quill.getModule('toolbar') as { container?: HTMLElement } | undefined;
        toolbar?.container?.querySelectorAll('button, select').forEach(control => {
            if (editable) control.removeAttribute('disabled'); else control.setAttribute('disabled', '');
        });
    }, [editable, state.ready]);

    useEffect(() => {
        const quill = quillReference.current;
        if (!state.ready || quill === undefined) return;
        quill.root.setAttribute('role', 'textbox');
        quill.root.setAttribute('aria-multiline', 'true');
        quill.root.setAttribute('aria-label', ariaLabel);
        if (placeholder === undefined) quill.root.removeAttribute('data-placeholder'); else quill.root.setAttribute('data-placeholder', placeholder);
    }, [ariaLabel, placeholder, state.ready]);

    return state;
}
