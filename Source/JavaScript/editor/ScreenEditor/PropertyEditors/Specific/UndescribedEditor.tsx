// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// What a property whose shape nothing describes gets: a diagnostic, never a box of JSON. The gap is in the component's descriptor, where it is
// fixed, and saying so is the point - a text box would let the author change what nothing says how to edit.
export const UndescribedEditor = ({ descriptor, context, id }: PropertyEditorProps<unknown>) => (
    <p id={id} className='studio-editor-structured__undescribed' role='alert'>{context.strings.editors.undescribed(descriptor.label)}</p>
);
