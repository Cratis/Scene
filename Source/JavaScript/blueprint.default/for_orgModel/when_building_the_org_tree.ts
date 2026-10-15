// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { buildOrgTree, descendantCount, expandedToDepth, placements, readOrgNodes, visibleNodes } from '../foundation';

const tree = (rows: unknown) => buildOrgTree(readOrgNodes(rows));
const outline = (roots: ReturnType<typeof tree>): string[] => roots.flatMap(node => [`${node.depth}:${node.id}`, ...outline(node.children)]);

describe('when building the org tree', () => {
    it('should read nodes with an id, keeping the first of a repeated id and defaulting the label', () => {
        readOrgNodes([{ id: 'a' }, { id: 'a', label: 'again' }, { label: 'no id' }, { id: 'b', label: 'B', parentId: '' }]).map(node => `${node.id}:${node.label}:${node.parentId}`).should.deep.equal(['a:a:undefined', 'b:B:undefined']);
    });

    it('should nest reports under their manager in row order', () => {
        outline(tree([{ id: 'ceo' }, { id: 'b', parentId: 'ceo' }, { id: 'c', parentId: 'ceo' }, { id: 'd', parentId: 'b' }])).should.deep.equal(['1:ceo', '2:b', '3:d', '2:c']);
    });

    it('should make someone whose manager is not in the data a root, and someone who reports to themselves', () => {
        outline(tree([{ id: 'a', parentId: 'gone' }, { id: 'b', parentId: 'b' }])).should.deep.equal(['1:a', '1:b']);
    });

    it('should cut a reporting cycle instead of looping', () => {
        outline(tree([{ id: 'a', parentId: 'b' }, { id: 'b', parentId: 'c' }, { id: 'c', parentId: 'a' }])).length.should.equal(3);
    });

    it('should draw only what the expansion reaches', () => {
        const roots = tree([{ id: 'ceo' }, { id: 'b', parentId: 'ceo' }, { id: 'd', parentId: 'b' }]);
        visibleNodes(roots, new Set()).map(node => node.id).should.deep.equal(['ceo']);
        visibleNodes(roots, new Set(['ceo'])).map(node => node.id).should.deep.equal(['ceo', 'b']);
        visibleNodes(roots, new Set(['ceo', 'b'])).map(node => node.id).should.deep.equal(['ceo', 'b', 'd']);
    });

    it('should open the first levels', () => {
        const roots = tree([{ id: 'ceo' }, { id: 'b', parentId: 'ceo' }, { id: 'd', parentId: 'b' }]);
        [...expandedToDepth(roots, 2)].should.deep.equal(['ceo']);
        [...expandedToDepth(roots, 3)].should.deep.equal(['ceo', 'b']);
    });

    it('should count the reports at any depth', () => {
        const roots = tree([{ id: 'ceo' }, { id: 'b', parentId: 'ceo' }, { id: 'd', parentId: 'b' }, { id: 'e', parentId: 'ceo' }]);
        descendantCount(roots[0]).should.equal(3);
    });

    it('should know each node siblings and parent', () => {
        const roots = tree([{ id: 'ceo' }, { id: 'b', parentId: 'ceo' }, { id: 'c', parentId: 'ceo' }]);
        const placed = placements(roots);
        placed.get('c')!.siblings.map(node => node.id).should.deep.equal(['b', 'c']);
        placed.get('c')!.parent!.id.should.equal('ceo');
        (placed.get('ceo')!.parent === undefined).should.equal(true);
    });
});
