// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createPropertyEditorRegistry } from './createPropertyEditorRegistry';

// The registry the screen editor resolves editors from unless its host supplies one (`environment.propertyEditors.registry`). One for the page, so an
// editor already loaded is not loaded again; a plugin registers its editors on it, or on a registry of its own passed to the editor.
export const screenEditorPropertyEditors = createPropertyEditorRegistry();
