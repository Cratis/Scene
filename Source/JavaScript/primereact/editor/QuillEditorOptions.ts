// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RefObject } from 'react';
import { QuillLoader } from './QuillLoader';

/** What {@link useQuillEditor} builds an editor from. */
export interface QuillEditorOptions {
    /** Loads Quill. Without one no editor is built. */
    loader: QuillLoader | undefined;

    /** The element the editor is built inside. React must render it with no children. */
    host: RefObject<HTMLElement | null>;

    /** The authored HTML. A change in it replaces the content; no other change does. */
    html: string;

    /** Whether the toolbar is shown. It is fixed when Quill is constructed, so a change rebuilds the editor. */
    showHeader: boolean;

    /** Whether the user can edit: not read only and not disabled. */
    editable: boolean;

    placeholder: string | undefined;
    ariaLabel: string;

    /** Called when the user, not the document, changed the content. */
    onUserChange(): void;
}
