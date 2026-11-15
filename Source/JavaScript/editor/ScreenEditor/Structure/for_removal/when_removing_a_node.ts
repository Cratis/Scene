// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { container, leaf, testAdapter } from '../given/testTree';
import { Ownership } from '../Ownership';
import { isRemovable, selectionAfterRemoval } from '../removal';

const tree = () => [container('root', [leaf('a'), leaf('b'), container('inner', [leaf('only')]), leaf('last')]), container('template', [leaf('given', Ownership.Inherited)], Ownership.Inherited)];

describe('when asking whether a node can be removed', () => {
    it('should allow a node of the author\'s own', () => isRemovable(tree(), 'b', testAdapter).should.be.true);
    it('should refuse the root of the screen', () => isRemovable(tree(), 'root', testAdapter).should.be.false);
    it('should refuse what a template gives the screen', () => isRemovable(tree(), 'given', testAdapter).should.be.false);
    it('should refuse a node that is not there', () => isRemovable(tree(), 'nope', testAdapter).should.be.false);
});

describe('when choosing what to select after a removal', () => {
    it('should take the sibling that takes its place', () => selectionAfterRemoval(tree(), 'a', testAdapter)!.should.equal('b'));
    it('should take the previous sibling when it was the last', () => selectionAfterRemoval(tree(), 'last', testAdapter)!.should.equal('inner'));
    it('should take the container when it was the only child', () => selectionAfterRemoval(tree(), 'only', testAdapter)!.should.equal('inner'));
    it('should take nothing for a node that is not there', () => (selectionAfterRemoval(tree(), 'nope', testAdapter) === undefined).should.be.true);
});
