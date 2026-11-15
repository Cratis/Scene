// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyEditorKind } from '@cratis/scene.model';
import { screenEditorPropertyEditors } from '../PropertyEditors/Registry/screenEditorPropertyEditors';

// The property editor kinds the screen editor draws itself: every id its property-editor registry resolves. Scene's design-time host offers a
// package's own editor for any other kind, and reports a kind nobody provides so the inspector falls back to the default editor for the value type.
// The registry is the one list: an editor added to it is host-drawn here without a second edit.
export const studioEditorKinds: readonly string[] = [...new Set([...screenEditorPropertyEditors.ids, ...Object.values(PropertyEditorKind)])];
