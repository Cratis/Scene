// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { applyEdit, elementNodeId } from '@cratis/scene.engine';
import { SceneEditKind, type SceneDocument } from '@cratis/scene.model';
import { ScreenEditorPrimeReactProvider } from '../../Host/ScreenEditorPrimeReactProvider';
import { PlayScreenView } from '../../Play/PlayScreen';
import { prepareSceneScreenDraft } from '../prepareSceneScreenDraft';
import { sceneScreenDraftRequest } from '../sceneScreenDraftRequest';
import { answer, context, edits, original, runtime } from '../for_sceneScreenDraftSession/given/a_layout_draft';

// Uses the production factories, admission and renderer projection, not a hand-guessed Scene element.
describe('when applying a factory-built layout-only draft through Scene', () => {
    let candidate: SceneDocument;
    beforeEach(() => {
        candidate = original;
        for (const edit of edits) {
            const result = applyEdit(candidate, edit, context);
            result.applied.should.be.true;
            candidate = result.model;
        }
    });

    it('should project the screen without query execution infrastructure', () => renderToStaticMarkup(createElement(ScreenEditorPrimeReactProvider, null, createElement(PlayScreenView, { document: candidate, runtime, resolveBinding: () => undefined }))).should.include('Customer details'));
    it('should prepare the entire layout with the production validator', () => {
        const result = prepareSceneScreenDraft(original, answer, { runtime, context, parameterlessQueryIds: [] });
        if (!result.prepared) throw new Error(result.problem);
        result.prepared.edits.should.have.lengthOf(edits.length);
        JSON.stringify(result.prepared.document).should.include('Customer name');
    });
    it('should offer only layout controls and no query properties or candidates', () => {
        const request = JSON.parse(sceneScreenDraftRequest('Add details', original, runtime).catalogue);
        request.queryDisplaySupported.should.be.false;
        (request.queryBindings === undefined).should.be.true;
        request.components.map((component: { component: string }) => component.component).should.include('PrimeReact:inputText');
        for (const component of request.components) {
            component.component.should.not.match(/table|dataView|commandForm|action|toolbar|dialog/i);
            component.properties.map((property: { path: string }) => property.path).should.not.include('query');
        }
    });
    it('should reject an otherwise supported input when its package is inactive', () => {
        const inactive = { ...runtime, profile: { ...runtime.profile, packages: ['core'] } };
        (prepareSceneScreenDraft(original, answer, { runtime: inactive, context, parameterlessQueryIds: [] }).prepared === undefined).should.be.true;
    });
    it('should refuse a query property after the complete valid layout instead of returning a partial candidate', () => {
        const result = prepareSceneScreenDraft(original, JSON.stringify({ reply: '', edits: [...edits, { kind: SceneEditKind.SetProperty, nodeId: elementNodeId('draft-input'), path: 'query', value: 'Customers' }] }), { runtime, context, parameterlessQueryIds: [] });
        (result.prepared === undefined).should.be.true;
    });
});
