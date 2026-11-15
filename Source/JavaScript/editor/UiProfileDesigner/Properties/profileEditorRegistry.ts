// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyEditorKind } from '@cratis/scene.model';
import { createPropertyEditorRegistry } from '../../ScreenEditor/PropertyEditors/Registry/createPropertyEditorRegistry';

// The screen editor's registry with the one editor the profile chooses differently: a template is chosen from the profile's own catalog, since the
// profile is not a document. Every other editor is the registry's, so a setting looks and behaves the same wherever it is edited.
export const profileEditorRegistry = createPropertyEditorRegistry()
    .register(PropertyEditorKind.SampleData, async () => (await import('../SampleData/ProfileSampleDataEditor')).ProfileSampleDataEditor)
    .register(PropertyEditorKind.Template, async () => (await import('./ProfileTemplateEditor')).ProfileTemplateEditor);
