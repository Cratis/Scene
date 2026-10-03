// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { countUnreadableEntries, toTreeNodes } from '../treeNodes';

describe('when converting entries', () => {
    describe('and no entry supplies a key', () => {
        const nodes = toTreeNodes([{ label: 'Documents', children: [{ label: 'Work' }, { label: 'Work' }] }]);

        it('should derive a key from the path', () => {
            nodes[0].key!.should.equal('0');
        });

        it('should keep two identically labeled siblings apart, so expansion and selection track the right row', () => {
            nodes[0].children![0].key!.should.equal('0-0');
            nodes[0].children![1].key!.should.equal('0-1');
        });
    });

    describe('and an entry supplies its own key', () => {
        const nodes = toTreeNodes([{ key: 'docs', label: 'Documents', children: [{ label: 'Work' }] }]);

        it('should keep it', () => {
            nodes[0].key!.should.equal('docs');
        });

        it('should build child keys from it', () => {
            nodes[0].children![0].key!.should.equal('docs-0');
        });
    });

    describe('and an entry is a bare string', () => {
        it('should use it as the label', () => {
            toTreeNodes(['Documents'])[0].label!.should.equal('Documents');
        });
    });

    describe('and an entry is a number or a boolean', () => {
        const nodes = toTreeNodes([7, true]);

        it('should show it as a leaf labeled with its text', () => {
            nodes.map(node => node.label).should.deep.equal(['7', 'true']);
        });
    });

    describe('and an entry is neither a scalar nor a record', () => {
        it('should drop it and count it as unreadable', () => {
            toTreeNodes([null, ['nested'], 'Documents']).should.have.lengthOf(1);
            countUnreadableEntries([null, ['nested'], 'Documents', { children: [null] }]).should.equal(3);
        });
    });

    describe('and an entry supplies a numeric key', () => {
        it('should keep it as a string', () => {
            toTreeNodes([{ key: 5, label: 'Five' }, { key: 'b', label: 'B' }]).map(node => node.key).should.deep.equal(['5', 'b']);
        });
    });

    describe('and two entries supply the same key', () => {
        const nodes = toTreeNodes([{ key: 'same', children: [{ key: 'same' }] }, { key: 'same' }, { key: 5 }, { key: '5' }]);

        it('should keep the first and give the later ones their own, so none share expansion or selection', () => {
            const keys = [nodes[0].key, nodes[0].children![0].key, nodes[1].key, nodes[2].key, nodes[3].key];
            keys[0]!.should.equal('same');
            new Set(keys).size.should.equal(5);
        });
    });
});
