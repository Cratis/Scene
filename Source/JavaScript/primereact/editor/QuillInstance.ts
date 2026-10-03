// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The part of a Quill editor this package uses.
 *
 * It is declared here instead of imported from `quill` so that this package's public types never name a
 * module the consumer may not have installed.
 */
export interface QuillInstance {
    /** The editable surface. */
    root: HTMLElement;

    clipboard: {
        /** Converts HTML to a Delta. Quill drops formats it does not know while doing so. */
        convert(content: { html?: string; text?: string }): unknown;
    };

    /** Replaces the content. `'silent'` suppresses the `text-change` event. */
    setContents(delta: unknown, source?: 'user' | 'api' | 'silent'): unknown;

    enable(enabled?: boolean): void;
    getText(): string;
    getModule(name: string): unknown;
    on(event: 'text-change', handler: (delta: unknown, previous: unknown, source: string) => void): unknown;
    off(event: 'text-change', handler: (delta: unknown, previous: unknown, source: string) => void): unknown;
}
