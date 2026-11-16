// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReferenceEditor } from '../Generic/ReferenceEditor';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// The reference editor with its target fixed: a descriptor that names the `sampleData` editor does not say what it references, because the
// editor id already does.
const forTarget = (target: string) => (props: PropertyEditorProps<string>) =>
    <ReferenceEditor {...props} descriptor={{ ...props.descriptor, editorOptions: { ...props.descriptor.editorOptions, reference: { target, ...props.descriptor.editorOptions?.reference } } }} />;

export const SampleDataEditor = forTarget('sampleData');
