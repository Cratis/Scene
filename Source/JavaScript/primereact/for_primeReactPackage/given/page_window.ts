// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What the Chromium entry puts on `window`, typed for the specifications that call it. */
export interface PageWindow {
    show(component: string, properties: unknown, size?: unknown, options?: ShowOptions): void;
    hide(): void;

    /** The interaction callbacks the controls fired, in order. */
    events: string[];

    /** The uploads the host handler received. */
    uploads: { names: string[]; url: string | undefined }[];
}

/** The host configuration `show` accepts. */
export interface ShowOptions {
    isEnabled?: boolean;
    quill?: 'real' | 'slow' | 'failing' | 'none';
    handler?: 'record' | 'slow' | 'failing';
    allowedOrigins?: string[];
}
