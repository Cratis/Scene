// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { SliceEditor } from './SliceEditor';

// The state change a button, an action or a command form submits - the slice editor restricted to State Change slices, which is what the
// package's `stateChangeReference` and `commandBinding` kinds always meant.
export const StateChangeEditor = (props: PropertyEditorProps<string>) =>
    <SliceEditor {...props} descriptor={{ ...props.descriptor, editorOptions: { kinds: ['StateChange'], ...props.descriptor.editorOptions } }} />;
