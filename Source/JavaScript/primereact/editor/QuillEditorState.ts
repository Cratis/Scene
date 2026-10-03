// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What {@link useQuillEditor} reports about the editor it manages. */
export interface QuillEditorState {
    /** Whether the editor is built and showing the content. */
    ready: boolean;

    /** Why the editor could not be built, once loading failed. */
    failure: string | undefined;

    /** The number of characters of text, `0` until ready. */
    characters: number;
}
