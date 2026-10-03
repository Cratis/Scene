// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QuillInstance } from './QuillInstance';
import { sanitizeHtml } from './sanitizeHtml';
import { serializeSafeNodes } from './serializeSafeNodes';

/**
 * Puts authored HTML into a Quill editor, silently.
 *
 * The HTML first goes through the allowlist, and what is left is converted by Quill's clipboard into a Delta
 * that `setContents` applies. The authored string is never assigned to `innerHTML`, so nothing in it can run;
 * and because the change is `'silent'` it raises no `text-change`, so loading a document is not reported as
 * the user editing it.
 *
 * @param quill The editor.
 * @param html The authored HTML.
 */
export function applyHtml(quill: QuillInstance, html: string): void {
    quill.setContents(quill.clipboard.convert({ html: serializeSafeNodes(sanitizeHtml(html)) }), 'silent');
}
