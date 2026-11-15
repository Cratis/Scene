// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DropZone } from '../DropZone';
import { resolveTreeDrop } from '../resolveTreeDrop';
import { container, leaf, testAdapter } from '../given/testTree';

const tree = () => [container('stack', [leaf('a'), leaf('b')]), leaf('c')];

describe('when dropping on the middle of a container row', () => {
    it('should move the node inside, at the end', () =>
        resolveTreeDrop(tree(), 'c', 'stack', DropZone.Inside, testAdapter)!.should.deep.equal({ nodeId: 'c', targetParentId: 'stack', index: 2 }));
});

describe('when dropping on the top edge of a row', () => {
    it('should place the node before that row in its parent', () =>
        resolveTreeDrop(tree(), 'c', 'b', DropZone.Before, testAdapter)!.should.deep.equal({ nodeId: 'c', targetParentId: 'stack', index: 1 }));
});

describe('when dropping on the bottom edge of a row', () => {
    it('should place the node after that row in its parent', () =>
        resolveTreeDrop(tree(), 'c', 'a', DropZone.After, testAdapter)!.should.deep.equal({ nodeId: 'c', targetParentId: 'stack', index: 1 }));
});

describe('when dropping a node after a later sibling in the same parent', () => {
    it('should count positions without the node being moved', () =>
        resolveTreeDrop(tree(), 'a', 'b', DropZone.After, testAdapter)!.should.deep.equal({ nodeId: 'a', targetParentId: 'stack', index: 1 }));
});

describe('when dropping on a row that does not exist', () => {
    it('should resolve to nothing', () => (resolveTreeDrop(tree(), 'c', 'missing', DropZone.After, testAdapter) === undefined).should.be.true);
});
