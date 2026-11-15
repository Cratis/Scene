// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { flattenStructure } from '../flattenStructure';
import { container, leaf, testAdapter } from '../given/testTree';

const tree = () => [container('stack', [leaf('a'), container('inner', [leaf('b')])]), leaf('c')];
const ids = (expanded: string[]) => flattenStructure(tree(), new Set(expanded), testAdapter).map(row => `${row.depth}:${row.id}`);

describe('when flattening a tree with nothing expanded', () => {
    it('should show only the top level', () => ids([]).should.deep.equal(['0:stack', '0:c']));
});

describe('when flattening a tree with a container expanded', () => {
    it('should show its children beneath it', () => ids(['stack']).should.deep.equal(['0:stack', '1:a', '1:inner', '0:c']));
});

describe('when flattening a tree with nested containers expanded', () => {
    it('should show every visible level with its depth', () => ids(['stack', 'inner']).should.deep.equal(['0:stack', '1:a', '1:inner', '2:b', '0:c']));
});

describe('when flattening a collapsed row', () => {
    it('should report that it has children but is not expanded', () => {
        const row = flattenStructure(tree(), new Set(), testAdapter)[0];
        (row.hasChildren && !row.isExpanded).should.be.true;
    });
});
