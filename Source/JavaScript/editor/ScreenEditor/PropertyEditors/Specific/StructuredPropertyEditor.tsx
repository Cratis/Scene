// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { StructuredValueEditor } from '../Structured/StructuredValueEditor';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// An object, a collection of records or a list of plain values, edited through what its descriptor describes - a field for each property, a
// row for each item, a control for each entry - nested as deep as the descriptor goes, so none of them is edited as JSON text.
export const StructuredPropertyEditor = ({ value, onChange, descriptor, context, disabled, id }: PropertyEditorProps<unknown>) => (
    <StructuredValueEditor descriptor={descriptor} value={value} idPrefix={id} strings={context.strings.structured} disabled={disabled === true} onChange={onChange} />
);
