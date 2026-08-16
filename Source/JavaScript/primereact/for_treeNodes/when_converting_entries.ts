// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { toTreeNodes } from '../treeNodes';

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

    describe('and an entry is neither a string nor a record', () => {
        it('should drop it', () => {
            toTreeNodes([7, ['nested'], 'Documents']).should.have.lengthOf(1);
        });
    });
});
