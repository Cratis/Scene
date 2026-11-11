// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NavigationModel } from '@cratis/scene.model';
import { NavigationEdit, addNavigationItem, applyNavigationEdits } from '../index';

const goldens = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../navigation-edit-raw-goldens.json'), 'utf-8')) as {
    plan: { ts: string };
    apply: { ts: string };
};

const item = (id: string) => ({ kind: 'navigation', id, title: id.toUpperCase() }) as never;

const declaring = (...outlets: { name: string; kind: string; defaults: unknown[] }[]): NavigationModel =>
    ({ application: { outlets }, modules: [] }) as unknown as NavigationModel;

const edit = (value: object) => value as unknown as NavigationEdit;

describe('when editing navigation where the runtimes differ', () => {
    it('should add under the parent of the first declaration of an outlet', () => {
        const navigation = declaring(
            { name: 'sidebar', kind: 'navigation', defaults: [item('a')] },
            { name: 'sidebar', kind: 'navigation', defaults: [item('a'), item('b')] });

        const outcome = applyNavigationEdits(navigation, [edit({ kind: 'addItem', outlet: 'sidebar', parent: 'a', item: item('c') })]);

        outcome.applied.should.be.true;
        outcome.model.application.outlets![0].defaults.map(candidate => candidate.id).should.deep.equal(['a']);
        outcome.model.application.outlets![1].defaults.map(candidate => candidate.id).should.deep.equal(['a', 'b']);
    });

    it('should move under the parent using the items without the moved one', () => {
        const navigation = declaring({ name: 'sidebar', kind: 'navigation', defaults: [item('a'), item('b')] });

        const outcome = applyNavigationEdits(navigation, [edit({ kind: 'moveItem', outlet: 'sidebar', id: 'b', parent: 'a' })]);

        outcome.model.application.outlets![0].defaults.map(candidate => candidate.id).should.deep.equal(['a']);
    });

    it('should refuse a sub-item of a flat outlet without reading the items of the level', () => {
        const unreadable = { name: 'topbar', kind: 'navigation', get defaults(): unknown[] { throw new Error('The items were read.'); } };
        const navigation = declaring(unreadable);

        const planned = addNavigationItem(navigation, undefined, 'topbar', item('x'), 'a');

        planned.rejected!.should.equal('The topbar is flat; its items have no sub-items.');
        planned.edits.should.deep.equal([]);
    });

    it('should serialize a plan with the property order the edits declare', () => {
        const navigation = declaring({ name: 'sidebar', kind: 'navigation', defaults: [item('a')] });
        const planned = addNavigationItem(navigation, 'plain', 'sidebar', item('n'), undefined, 1);
        JSON.stringify(planned.edits).should.equal(goldens.plan.ts);
    });

    it('should serialize an applied model with the property order the model declares', () => {
        const navigation = declaring({ name: 'sidebar', kind: 'navigation', defaults: [item('a')] });
        const outcome = applyNavigationEdits(navigation, [edit({ kind: 'addItem', outlet: 'sidebar', parent: 'a', item: item('c') })]);
        JSON.stringify(outcome.model).should.equal(goldens.apply.ts);
    });
});
