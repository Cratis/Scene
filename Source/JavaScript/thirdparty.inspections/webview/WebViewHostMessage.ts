// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** A message the webview sends to the editor that embeds it. */
export interface WebViewHostMessage {
    type: 'ready' | 'command' | 'navigate';
    payload?: unknown;
}
