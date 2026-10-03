// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QuillInstance } from './QuillInstance';

/** The number of characters of text in the editor, not counting the newline Quill always ends with. */
export function characterCount(quill: QuillInstance): number {
    return Math.max(quill.getText().length - 1, 0);
}
