// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, SceneDocument, SceneEdit, SceneEditKind, CollectionOperation } from '@cratis/scene.model';
import { applyEdit, resolveEffectiveConfiguration, resolveTemplateChain } from '../index';
import { catalog, contextFor, createSceneDocument, scopeOf } from '../given/a_scene_document';

describe('when round tripping edits', () => {
    const moduleContext = contextFor(EditingScopeKind.ScreenTemplate, 'Module');
    const featureContext = contextFor(EditingScopeKind.ScreenTemplate, 'Feature');

    const script: [SceneEdit, typeof moduleContext][] = [
        [{ kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'items', operations: [CollectionOperation.Add, CollectionOperation.Reorder] } }, moduleContext],
        [{ kind: SceneEditKind.ExposeProperty, owner: 'Module', property: { component: 'navbar', path: 'title' } }, moduleContext],
        [{ kind: SceneEditKind.SetInstanceValue, component: 'navbar', path: 'title', value: 'Billing' }, featureContext],
        [{ kind: SceneEditKind.AddCollectionItem, component: 'navbar', path: 'items', item: { id: 'a', values: { label: 'A', icon: { library: 'lucide', key: 'a' } } } }, featureContext],
        [{ kind: SceneEditKind.AddCollectionItem, component: 'navbar', path: 'items', item: { id: 'b', values: { label: 'B' } } }, featureContext],
        [{ kind: SceneEditKind.ReorderCollectionItem, component: 'navbar', path: 'items', itemId: 'b', index: 0 }, featureContext],
    ];

    function run(edits: [SceneEdit, typeof moduleContext][]): SceneDocument {
        return edits.reduce((document, [edit, context]) => applyEdit(document, edit, context).model, createSceneDocument());
    }

    it('should end in the same document when the edits are persisted and replayed', () => {
        const replayed = JSON.parse(JSON.stringify(script)) as typeof script;
        run(replayed).should.deep.equal(run(script));
    });

    it('should apply every edit in the script', () => {
        let document = createSceneDocument();
        for (const [edit, context] of script) {
            const outcome = applyEdit(document, edit, context);
            outcome.applied.should.be.true;
            document = outcome.model;
        }
    });

    it('should survive being saved and loaded as JSON', () => {
        const document = run(script);
        JSON.parse(JSON.stringify(document)).should.deep.equal(document);
    });

    it('should give the editor and the runtime the same resolution', () => {
        const document = run(script);
        const chain = resolveTemplateChain(document, scopeOf(EditingScopeKind.ScreenTemplate, 'Feature', 'Shell'));
        const configuration = resolveEffectiveConfiguration(chain, document.instanceContributions, catalog);

        (configuration.components[0].properties.items as { id: string }[]).map(item => item.id).should.deep.equal(['home', 'b', 'a']);
        (configuration.components[0].properties.title as string).should.equal('Billing');
        configuration.diagnostics.should.be.empty;
    });

    it('should undo an edit by keeping the document before it', () => {
        const before = run(script.slice(0, 4));
        const after = applyEdit(before, script[4][0], script[4][1]).model;
        (after === before).should.be.false;
        before.instanceContributions[1].items!.map(item => item.id).should.deep.equal(['a']);
    });
});
