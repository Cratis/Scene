// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QuillInstance } from '../../editor/QuillInstance';
import { QuillOptions } from '../../editor/QuillOptions';

type Listener = (delta: unknown, previous: unknown, source: string) => void;

/**
 * A stand-in for Quill that records how it is driven.
 *
 * It keeps the shape of the calls the control makes - construct into a container, `clipboard.convert`,
 * `setContents`, `enable`, `on` and `off` - without needing a layout engine, so a specification can ask how
 * many editors were built, what was loaded into them and whether anything leaked. Real Quill runs in the
 * Chromium specifications.
 */
export class FakeQuill implements QuillInstance {
    static instances: FakeQuill[] = [];

    readonly root = document.createElement('div');
    readonly toolbar = document.createElement('div');
    readonly listeners = new Set<Listener>();
    readonly setContentsCalls: { html: string; source: string | undefined }[] = [];
    enabled = true;

    clipboard = { convert: ({ html }: { html?: string }) => ({ html: html ?? '' }) };

    constructor(readonly container: HTMLElement, readonly options: QuillOptions) {
        this.toolbar.className = 'fake-toolbar';
        this.toolbar.innerHTML = '<button type="button">Bold</button><select><option>Normal</option></select>';
        if (options.theme === 'snow' && options.modules.toolbar !== false) container.parentElement?.insertBefore(this.toolbar, container);
        this.root.className = 'fake-editor';
        container.appendChild(this.root);
        FakeQuill.instances.push(this);
    }

    setContents(delta: unknown, source?: 'user' | 'api' | 'silent') {
        const html = (delta as { html: string }).html;
        this.setContentsCalls.push({ html, source });
        this.root.textContent = html.replace(/<[^>]*>/g, '');
    }

    enable(enabled = true) { this.enabled = enabled; }
    getText() { return `${this.root.textContent ?? ''}\n`; }
    getModule() { return { container: this.toolbar }; }
    on(_event: 'text-change', handler: Listener) { this.listeners.add(handler); }
    off(_event: 'text-change', handler: Listener) { this.listeners.delete(handler); }

    /** Types into the editor the way a user does. */
    type(text: string, source = 'user') {
        this.root.textContent = `${this.root.textContent ?? ''}${text}`;
        [...this.listeners].forEach(listener => listener({}, {}, source));
    }

    static get latest(): FakeQuill { return FakeQuill.instances[FakeQuill.instances.length - 1]; }
    static get live(): FakeQuill[] { return FakeQuill.instances.filter(instance => instance.container.isConnected); }
}

/** A loader that resolves to {@link FakeQuill}, as `() => import('quill')` resolves to Quill's module. */
export const fakeQuillLoader = () => Promise.resolve({ default: FakeQuill });
