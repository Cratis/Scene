// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { defaultScreenEditorStrings } from '../../ScreenEditor/Defaults/defaultScreenEditorStrings';
import type { ScreenEditorStrings } from '../../ScreenEditor/Inspector/ScreenEditorStrings';
import type { EditorContext, EditorLookups } from '../../ScreenEditor/PropertyEditors/Registry/PropertyEditorProps';
import { defaultPropertyEditorStrings } from '../../ScreenEditor/PropertyEditors/Registry/PropertyEditorStrings';
import { defaultStructuredEditorStrings } from '../../ScreenEditor/PropertyEditors/Structured/defaultStructuredEditorStrings';
import type { ColorToken } from '../../ScreenEditor/PropertyEditors/Registry/PropertyEditorProps';

const emptyDocument: SceneDocument = { layouts: [], screenTemplates: [], dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] };

export interface ProfileEditorLookups {
    colorTokens?: readonly ColorToken[];
    references?: EditorLookups['references'];
}

// What the registry's editors may ask about where they are used, for a property of the profile rather than of a screen element: there is no
// screen document, selection or ownership, so the context is the registry's own words with nothing to look up unless the section lends something.
export function createProfileEditorContext(strings: ScreenEditorStrings, lookups: ProfileEditorLookups = {}): EditorContext {
    const text = strings.properties;
    const empty = [] as const;
    return {
        model: emptyDocument,
        level: 'screen',
        structure: { onCanvas: false },
        lookups: {
            stateChangeSlices: empty,
            slices: empty,
            destinations: empty,
            slots: empty,
            queryCandidates: empty,
            availableSources: {},
            fields: empty,
            colorTokens: lookups.colorTokens ?? empty,
            icons: undefined as unknown as EditorLookups['icons'],
            references: lookups.references ?? (() => empty),
        },
        strings: {
            editors: text.editors ?? defaultPropertyEditorStrings,
            structured: text.structured ?? defaultStructuredEditorStrings,
            icon: text.icon,
            iconPicker: (text.iconPickerLabels ?? defaultScreenEditorStrings.properties.iconPickerLabels ?? {}) as unknown as Record<string, string>,
        },
    };
}
