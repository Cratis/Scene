// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Form, QueryCandidate, SceneDocument, SceneEdit, SceneElement } from '@cratis/scene.model';
import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createScreenDocument } from '../../Document/studioScreen';
import { createPanel } from '../../Document/createPanel';
import { LayoutItem } from '../../Layouts/LayoutItem';
import type { DataFieldInsertion } from '../insertDataField';

export const setPrice: StateChangeSlice = {
    id: 'slice-1', name: 'Set price', commandName: 'SetProductPrice', origin: [],
    inputs: [{ name: 'sku', type: 'ProductSku', required: true }, { name: 'price', type: 'Money', required: true }],
};

export const productBySku: QueryCandidate = {
    id: 'q-1', name: 'ProductBySku', origin: [], parameters: [], resultShape: 'single', resultFields: [{ name: 'name', type: 'string' }],
};

export interface Recorded {
    inserted: { element: SceneElement; parentId: string | undefined; index: number | undefined }[];
    forms: Form[][];
    selected: (string | undefined)[];
    applied: { edit: SceneEdit; label: string }[];
}

export function insertionFor(children: SceneElement[], forms: Form[], packages: Record<string, string[]> = { 'Cratis.Components': ['commandForm', 'singleResult', 'dataTable'] }, queryCandidates: QueryCandidate[] = [productBySku]): { insertion: DataFieldInsertion; recorded: Recorded } {
    const root = createPanel(LayoutItem.Stack, 'screen-root', 'Screen', children);
    const document: SceneDocument = createScreenDocument(root);
    const withForms: SceneDocument = { ...document, screens: document.screens.map(screen => ({ ...screen, forms })) };
    const recorded: Recorded = { inserted: [], forms: [], selected: [], applied: [] };
    const insertion: DataFieldInsertion = {
        controller: {
            document: withForms,
            composition: { roots: [root] } as unknown as DataFieldInsertion['controller']['composition'],
            insertElement: (element, parentId, index) => { recorded.inserted.push({ element, parentId, index }); },
            setScreenForms: next => { recorded.forms.push(next); },
            select: id => { recorded.selected.push(id); },
            apply: (edit, label) => { recorded.applied.push({ edit, label }); },
        },
        packages,
        stateChangeSlices: [setPrice],
        queryCandidates,
        bindsQuery: () => true,
        newId: () => 'new-element',
    };
    return { insertion, recorded };
}

export const placedForm = () => createExternalComponent('form', 'Form', 'Cratis.Components:commandForm', { command: 'slice-1' });
