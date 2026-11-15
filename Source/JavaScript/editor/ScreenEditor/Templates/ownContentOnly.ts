// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Panel } from '@cratis/scene.model';
import { LayoutItem } from '../Layouts/LayoutItem';
import { createPanel } from '../Document/createPanel';
import { compositionId, type EditorComposition } from './composeEditorScreen';

/**
 * The composition without what the screen's templates put around its own content: a slice's prototype is the slice's content, and the template (and the
 * application shell around it) are there to see in context only when the author asks for them.
 *
 * What is dropped is only what is drawn. The document, the structure, the selection and the drop regions are still the full composition's, so showing the
 * template again puts back exactly what was there.
 *
 * @param composition The composition the editor edits.
 * @returns The composition's element, with only what the screen itself authored.
 */
export function ownContentOnly(composition: EditorComposition): Panel {
    if (composition.templates.length === 0) return composition.element;
    return createPanel(LayoutItem.Stack, compositionId, 'Composition', [...composition.own, ...composition.chrome]);
}
