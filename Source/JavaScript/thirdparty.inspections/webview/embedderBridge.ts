// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { WebViewHostMessage } from './WebViewHostMessage';

/** The part of the VS Code webview API the example uses. */
interface VsCodeApi {
    postMessage(message: WebViewHostMessage): void;
}

declare global {
    // Provided by VS Code to webviews, and by Event Models' embedding page.
    // eslint-disable-next-line no-var
    var acquireVsCodeApi: (() => VsCodeApi) | undefined;
}

/**
 * Forwards Scene's host-neutral `cratis.scene.*` events to the embedding editor: VS Code's webview API when it
 * is there, otherwise the parent frame. This is the only channel between rendered content and the embedder.
 */
export function connectEmbedder(): (message: WebViewHostMessage) => void {
    const api = typeof globalThis.acquireVsCodeApi === 'function' ? globalThis.acquireVsCodeApi() : undefined;
    const post = (message: WebViewHostMessage) => (api ? api.postMessage(message) : window.parent.postMessage(message, '*'));

    globalThis.addEventListener('cratis.scene.command', event => {
        const { command, arguments: args } = (event as CustomEvent<{ command: string; arguments: Record<string, unknown> }>).detail;
        post({ type: 'command', payload: { command, arguments: args } });
    });
    globalThis.addEventListener('cratis.scene.navigate', event => {
        const { destination, targetScreen } = (event as CustomEvent<{ destination?: unknown; targetScreen?: string }>).detail;
        post({ type: 'navigate', payload: destination ?? { screen: targetScreen } });
    });

    return post;
}
