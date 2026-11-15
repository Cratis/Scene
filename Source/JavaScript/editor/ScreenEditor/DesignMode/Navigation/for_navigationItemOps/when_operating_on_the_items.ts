// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, type OutletNavigationItem } from '@cratis/scene.model';
import { changeItem, cloneItem, duplicateItem, findItem, moveItem, removeItem, siblingsOf } from '../navigationItemOps';

const items = (): OutletNavigationItem[] => [
    { kind: OutletItemKind.Navigation, id: 'a', title: 'A', target: { module: 'sales' } },
    { kind: OutletItemKind.Navigation, id: 'b', title: 'B', children: [{ kind: OutletItemKind.Navigation, id: 'b1', title: 'B1' }, { kind: OutletItemKind.Navigation, id: 'b2', title: 'B2' }] },
    { kind: OutletItemKind.Navigation, id: 'c', title: 'C' },
];
const titles = (list: readonly OutletNavigationItem[]): string[] => list.flatMap(item => [item.title, ...(item.children ? titles(item.children).map(child => `>${child}`) : [])]);
let counter = 0;
const newId = () => `n${++counter}`;

describe('when changing an item', () => {
    it('should change a top-level item', () => changeItem(items(), 'a', { title: 'Alpha' })[0].title.should.equal('Alpha'));
    it('should change a nested item', () => findItem(changeItem(items(), 'b2', { title: 'Beta two' }), 'b2')!.title.should.equal('Beta two'));
    it('should unset a field given as undefined, so the item no longer carries it', () => ('target' in changeItem(items(), 'a', { target: undefined })[0]).should.be.false);
    it('should leave the list it was given alone', () => { const before = items(); changeItem(before, 'a', { title: 'x' }); before[0].title.should.equal('A'); });
});

describe('when removing an item', () => {
    it('should remove it with what is under it', () => titles(removeItem(items(), 'b')).should.deep.equal(['A', 'C']));
    it('should remove a nested one', () => titles(removeItem(items(), 'b1')).should.deep.equal(['A', 'B', '>B2', 'C']));
});

describe('when moving an item', () => {
    it('should move a top-level item', () => titles(moveItem(items(), 'a', 2)).should.deep.equal(['B', '>B1', '>B2', 'C', 'A']));
    it('should move a nested item among its siblings', () => titles(moveItem(items(), 'b1', 1)).should.deep.equal(['A', 'B', '>B2', '>B1', 'C']));
    it('should not move it past the end', () => titles(moveItem(items(), 'c', 3)).should.deep.equal(['A', 'B', '>B1', '>B2', 'C']));
});

describe('when finding the siblings of an item', () => {
    it('should find the top level', () => siblingsOf(items(), 'a')!.should.have.length(3));
    it('should find the children of the parent', () => siblingsOf(items(), 'b2')!.should.have.length(2));
    it('should find nothing for an item that is not there', () => (siblingsOf(items(), 'zz') === undefined).should.be.true);
});

describe('when duplicating an item', () => {
    const { items: result, copy } = duplicateItem(items(), 'b', newId);
    it('should put a copy right after it', () => titles(result).should.deep.equal(['A', 'B', '>B1', '>B2', 'B', '>B1', '>B2', 'C']));
    it('should give the copy and what is under it identities of their own', () => { copy!.id.should.not.equal('b'); copy!.children!.map(child => child.id).should.not.include.members(['b1', 'b2']); });
    it('should leave the original as it was', () => findItem(result, 'b')!.children!.map(child => child.id).should.deep.equal(['b1', 'b2']));
});

describe('when cloning an item', () => {
    it('should carry its target over without sharing it', () => { const original = items()[0]; const copy = cloneItem(original, newId); copy.target!.should.deep.equal(original.target); (copy.target === original.target).should.be.false; });
});
