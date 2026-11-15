// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { MoveIntent } from '../MoveIntent';
import { resolveMoveIntentEdit } from '../resolveMoveIntentEdit';
import { container, leaf, testAdapter } from '../given/testTree';

const tree = () => [container('stack', [leaf('a'), leaf('b'), container('inner', [leaf('c')])]), leaf('d')];

describe('when moving a node up', () => {
    it('should target the position before it', () =>
        resolveMoveIntentEdit(tree(), 'b', MoveIntent.MoveUp, testAdapter)!.should.deep.equal({ nodeId: 'b', targetParentId: 'stack', index: 0 }));
});

describe('when moving the first node up', () => {
    it('should have nowhere to go', () => (resolveMoveIntentEdit(tree(), 'a', MoveIntent.MoveUp, testAdapter) === undefined).should.be.true);
});

describe('when moving a node down', () => {
    it('should target the position after it', () =>
        resolveMoveIntentEdit(tree(), 'a', MoveIntent.MoveDown, testAdapter)!.should.deep.equal({ nodeId: 'a', targetParentId: 'stack', index: 1 }));
});

describe('when moving the last node down', () => {
    it('should have nowhere to go', () => (resolveMoveIntentEdit(tree(), 'd', MoveIntent.MoveDown, testAdapter) === undefined).should.be.true);
});

describe('when outdenting a nested node', () => {
    it('should place it right after its parent', () =>
        resolveMoveIntentEdit(tree(), 'c', MoveIntent.Outdent, testAdapter)!.should.deep.equal({ nodeId: 'c', targetParentId: 'stack', index: 3 }));
});

describe('when outdenting a top-level node', () => {
    it('should have nowhere to go', () => (resolveMoveIntentEdit(tree(), 'd', MoveIntent.Outdent, testAdapter) === undefined).should.be.true);
});

describe('when indenting a node whose previous sibling is a container', () => {
    it('should make it that container\'s last child', () =>
        resolveMoveIntentEdit(tree(), 'd', MoveIntent.Indent, testAdapter)!.should.deep.equal({ nodeId: 'd', targetParentId: 'stack', index: 3 }));
});

describe('when indenting a node whose previous sibling is not a container', () => {
    it('should have nowhere to go', () => (resolveMoveIntentEdit(tree(), 'b', MoveIntent.Indent, testAdapter) === undefined).should.be.true);
});
