// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { container, leaf, testAdapter } from '../given/testTree';
import { surfaceMoveEdit } from '../surfaceMoveEdit';
import { validateStructureEdit } from '../validateStructureEdit';
import { StructureEditRejection } from '../StructureEditRejection';

const tree = () => [container('stack', [leaf('a'), leaf('b'), leaf('c')]), container('other', [leaf('x')])];

describe('when dropping an element below its own place in the same container', () => {
    it('should count the position without the element', () => surfaceMoveEdit(tree(), testAdapter, 'a', 'stack', 3)!.should.deep.equal({ nodeId: 'a', targetParentId: 'stack', index: 2 }));
});

describe('when dropping an element above its own place in the same container', () => {
    it('should keep the position', () => surfaceMoveEdit(tree(), testAdapter, 'c', 'stack', 0)!.should.deep.equal({ nodeId: 'c', targetParentId: 'stack', index: 0 }));
});

describe('when dropping an element into another container', () => {
    it('should keep the position', () => surfaceMoveEdit(tree(), testAdapter, 'a', 'other', 1)!.should.deep.equal({ nodeId: 'a', targetParentId: 'other', index: 1 }));
});

describe('when dropping an element on the marker right beside it', () => {
    it('should ask for no change, on both sides', () => {
        validateStructureEdit(tree(), surfaceMoveEdit(tree(), testAdapter, 'b', 'stack', 1)!, testAdapter)!.should.equal(StructureEditRejection.NoChange);
        validateStructureEdit(tree(), surfaceMoveEdit(tree(), testAdapter, 'b', 'stack', 2)!, testAdapter)!.should.equal(StructureEditRejection.NoChange);
    });
});

describe('when dropping a container into itself', () => {
    it('should be refused as a cycle', () => validateStructureEdit(tree(), surfaceMoveEdit(tree(), testAdapter, 'stack', 'stack', 0)!, testAdapter)!.should.equal(StructureEditRejection.WouldCreateCycle));
});

describe('when the element is not there', () => {
    it('should ask for nothing', () => (surfaceMoveEdit(tree(), testAdapter, 'nope', 'stack', 0) === undefined).should.be.true);
});
