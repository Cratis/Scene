// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Ownership } from '../Ownership';
import { StructureEditRejection } from '../StructureEditRejection';
import { validateStructureEdit } from '../validateStructureEdit';
import { container, leaf, testAdapter } from '../given/testTree';

const tree = () => [
    container('stack', [leaf('a'), container('inner', [leaf('b')])]),
    leaf('c'),
    container('empty'),
    container('template', [leaf('t')], Ownership.Inherited),
    leaf('locked', Ownership.Inherited),
];

describe('when moving a node into an empty container', () => {
    it('should be allowed', () =>
        (validateStructureEdit(tree(), { nodeId: 'c', targetParentId: 'empty', index: 0 }, testAdapter) === undefined).should.be.true);
});

describe('when moving a container into its own descendant', () => {
    it('should be rejected as a cycle', () =>
        validateStructureEdit(tree(), { nodeId: 'stack', targetParentId: 'inner', index: 0 }, testAdapter)!.should.equal(StructureEditRejection.WouldCreateCycle));
});

describe('when moving a container into itself', () => {
    it('should be rejected as a cycle', () =>
        validateStructureEdit(tree(), { nodeId: 'stack', targetParentId: 'stack', index: 0 }, testAdapter)!.should.equal(StructureEditRejection.WouldCreateCycle));
});

describe('when moving a node into something that is not a container', () => {
    it('should be rejected', () =>
        validateStructureEdit(tree(), { nodeId: 'a', targetParentId: 'c', index: 0 }, testAdapter)!.should.equal(StructureEditRejection.TargetNotContainer));
});

describe('when moving an inherited node', () => {
    it('should be rejected as locked', () =>
        validateStructureEdit(tree(), { nodeId: 'locked', targetParentId: null, index: 0 }, testAdapter)!.should.equal(StructureEditRejection.NodeLocked));
});

describe('when moving a node into inherited content', () => {
    it('should be rejected as a locked target', () =>
        validateStructureEdit(tree(), { nodeId: 'c', targetParentId: 'template', index: 0 }, testAdapter)!.should.equal(StructureEditRejection.TargetLocked));
});

describe('when moving a node that does not exist', () => {
    it('should be rejected', () =>
        validateStructureEdit(tree(), { nodeId: 'missing', targetParentId: null, index: 0 }, testAdapter)!.should.equal(StructureEditRejection.NodeNotFound));
});

describe('when moving a node into a parent that does not exist', () => {
    it('should be rejected', () =>
        validateStructureEdit(tree(), { nodeId: 'c', targetParentId: 'missing', index: 0 }, testAdapter)!.should.equal(StructureEditRejection.TargetNotFound));
});

describe('when moving a node to the place it already is', () => {
    it('should be rejected as no change', () =>
        validateStructureEdit(tree(), { nodeId: 'c', targetParentId: null, index: 1 }, testAdapter)!.should.equal(StructureEditRejection.NoChange));
});
