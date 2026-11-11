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

const childrenOf = (value: unknown): { id: string }[] => (value as { children?: { id: string }[] }).children ?? [];

const edit = (value: object) => value as unknown as NavigationEdit;

describe('when editing navigation where the runtimes differ', () => {
    it('should add under the parent of the first declaration of an outlet', () => {
        const navigation = declaring(
            { name: 'sidebar', kind: 'navigation', defaults: [item('a')] },
            { name: 'sidebar', kind: 'navigation', defaults: [item('a'), item('b')] });

        const outcome = applyNavigationEdits(navigation, [edit({ kind: 'addItem', outlet: 'sidebar', parent: 'a', item: item('c') })]);

        outcome.applied.should.be.true;
        // The runtimes differ on which declaration receives the sub-item (Cratis/Scene#300); the TypeScript engine edits the first one.
        const [first, second] = outcome.model.application.outlets!;
        first.defaults.map(candidate => candidate.id).should.deep.equal(['a']);
        childrenOf(first.defaults[0]).map(candidate => candidate.id).should.deep.equal(['c']);
        second.defaults.map(candidate => candidate.id).should.deep.equal(['a', 'b']);
        second.defaults.forEach(candidate => childrenOf(candidate).should.deep.equal([]));
    });

    it('should move under the parent using the items without the moved one', () => {
        const navigation = declaring({ name: 'sidebar', kind: 'navigation', defaults: [item('a'), item('b')] });

        const outcome = applyNavigationEdits(navigation, [edit({ kind: 'moveItem', outlet: 'sidebar', id: 'b', parent: 'a' })]);

        const [outlet] = outcome.model.application.outlets!;
        outlet.defaults.map(candidate => candidate.id).should.deep.equal(['a']);
        childrenOf(outlet.defaults[0]).map(candidate => candidate.id).should.deep.equal(['b']);
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
