// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { defaultScreenEditorStrings } from '../../../../Defaults/defaultScreenEditorStrings';
import { defaultStructuredEditorStrings } from '../../../Structured/defaultStructuredEditorStrings';
import type { EditorContext, EditorLookups } from '../../PropertyEditorProps';
import { defaultPropertyEditorStrings } from '../../PropertyEditorStrings';

// A context with what the editors read: the words and lookups. Everything a spec does not need is empty.
export const anEditorContext = (lookups: Partial<EditorLookups> = {}): EditorContext => ({
    model: {} as SceneDocument,
    level: 'screen',
    structure: { onCanvas: true },
    lookups: {
        stateChangeSlices: [], slices: [], destinations: [], slots: [], queryCandidates: [], availableSources: {}, fields: [], colorTokens: [],
        icons: {} as EditorLookups['icons'], references: () => [], ...lookups,
    },
    strings: { editors: defaultPropertyEditorStrings, structured: defaultStructuredEditorStrings, icon: defaultScreenEditorStrings.properties.icon, iconPicker: {} },
});
