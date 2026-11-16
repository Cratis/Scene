// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applyStructureEdit } from '../applyStructureEdit';
import { StructureEditRejection } from '../StructureEditRejection';
import type { StructureEditResult } from '../StructureEditResult';
import { container, leaf, shapeOf, testAdapter, type TestNode } from '../given/testTree';

const tree = (): TestNode[] => [container('stack', [leaf('a'), leaf('b')]), leaf('c'), container('empty')];
const shape = (result: StructureEditResult<TestNode>) => result.accepted ? shapeOf(result.roots) : result.reason;

describe('when reordering within a parent', () => {
    it('should put the node at the requested position', () =>
        shape(applyStructureEdit(tree(), { nodeId: 'a', targetParentId: 'stack', index: 1 }, testAdapter)).should.equal('stack(b,a),c,empty'));
});

describe('when reparenting into another container', () => {
    it('should move the node under the new parent', () =>
        shape(applyStructureEdit(tree(), { nodeId: 'c', targetParentId: 'stack', index: 1 }, testAdapter)).should.equal('stack(a,c,b),empty'));
});

describe('when reparenting into an empty container', () => {
    it('should make it the container\'s only child', () =>
        shape(applyStructureEdit(tree(), { nodeId: 'a', targetParentId: 'empty', index: 0 }, testAdapter)).should.equal('stack(b),c,empty(a)'));
});

describe('when moving a nested node to the top level', () => {
    it('should place it among the top-level nodes', () =>
        shape(applyStructureEdit(tree(), { nodeId: 'b', targetParentId: null, index: 0 }, testAdapter)).should.equal('b,stack(a),c,empty'));
});

describe('when moving with an index past the end', () => {
    it('should clamp to the end', () =>
        shape(applyStructureEdit(tree(), { nodeId: 'a', targetParentId: 'empty', index: 99 }, testAdapter)).should.equal('stack(b),c,empty(a)'));
});

describe('when the move is refused', () => {
    it('should report the reason and leave the tree alone', () => {
        const original = tree();
        const result = applyStructureEdit(original, { nodeId: 'stack', targetParentId: 'stack', index: 0 }, testAdapter);
        (!result.accepted && result.reason === StructureEditRejection.WouldCreateCycle && shapeOf(original) === 'stack(a,b),c,empty').should.be.true;
    });
});

describe('when the move is applied', () => {
    it('should not change the tree it was given', () => {
        const original = tree();
        applyStructureEdit(original, { nodeId: 'c', targetParentId: 'stack', index: 0 }, testAdapter);
        shapeOf(original).should.equal('stack(a,b),c,empty');
    });

    it('should share the branches it did not touch', () => {
        const original = tree();
        const result = applyStructureEdit(original, { nodeId: 'c', targetParentId: 'stack', index: 0 }, testAdapter);
        (result.accepted && result.roots[1] === original[2]).should.be.true;
    });
});
