// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentGroupsKey, componentUsageKey, createComponentPickerMemory, type ComponentPickerStorage } from '../componentPickerStorage';

const storageOf = (initial: Record<string, string> = {}): ComponentPickerStorage & { data: Record<string, string> } => {
    const data = { ...initial };
    return { data, getItem: key => data[key] ?? null, setItem: (key, value) => { data[key] = value; } };
};

describe('when recording a component that was added', () => {
    const storage = storageOf();
    const memory = createComponentPickerMemory(storage);
    memory.recordAdded('P:button', 100);
    memory.recordAdded('P:button', 200);
    const usage = memory.recordAdded('P:table', 300);

    it('should count each add', () => usage['P:button'].count.should.equal(2));
    it('should remember when it was last added', () => usage['P:button'].last.should.equal(200));
    it('should keep it for the next time', () => createComponentPickerMemory(storage).readUsage().should.deep.equal(usage));
    it('should store it under the picker\'s key', () => Object.keys(storage.data).should.deep.equal([componentUsageKey]));
});

describe('when two people share a browser', () => {
    const storage = storageOf();
    createComponentPickerMemory(storage, 'alice').recordAdded('P:button');

    it('should keep what each added apart', () => Object.keys(createComponentPickerMemory(storage, 'bob').readUsage()).should.deep.equal([]));
    it('should keep each one\'s own', () => Object.keys(createComponentPickerMemory(storage, 'alice').readUsage()).should.deep.equal(['P:button']));
});

describe('when remembering which groups are open', () => {
    const storage = storageOf();
    createComponentPickerMemory(storage).writeGroups({ Navigation: true, Input: false });

    it('should read them back', () => createComponentPickerMemory(storage).readGroups().should.deep.equal({ Navigation: true, Input: false }));
    it('should store them under their own key', () => Object.keys(storage.data).should.deep.equal([componentGroupsKey]));
});

describe('when the storage holds something else', () => {
    it('should read nothing from text that is not JSON', () => createComponentPickerMemory(storageOf({ [componentUsageKey]: 'not json' })).readUsage().should.deep.equal({}));
    it('should read nothing from an array', () => createComponentPickerMemory(storageOf({ [componentUsageKey]: '[1]' })).readUsage().should.deep.equal({}));
    it('should drop entries that are not counts', () =>
        createComponentPickerMemory(storageOf({ [componentUsageKey]: JSON.stringify({ a: { count: 2, last: 1 }, b: { count: 'x' }, c: null, d: { count: -1, last: 1 } }) })).readUsage().should.deep.equal({ a: { count: 2, last: 1 } }));
    it('should drop group states that are not booleans', () =>
        createComponentPickerMemory(storageOf({ [componentGroupsKey]: JSON.stringify({ a: true, b: 'yes' }) })).readGroups().should.deep.equal({ a: true }));
});

describe('when there is no usable storage', () => {
    const blocked: ComponentPickerStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } };

    it('should still count within the session, and not throw', () => {
        const memory = createComponentPickerMemory(blocked);
        memory.recordAdded('P:button', 1);
        memory.recordAdded('P:button', 2).should.deep.equal({ 'P:button': { count: 2, last: 2 } });
        memory.readUsage()['P:button'].count.should.equal(2);
    });
    it('should still hold the groups within the session', () => {
        const memory = createComponentPickerMemory(blocked);
        memory.writeGroups({ Input: true });
        memory.readGroups().should.deep.equal({ Input: true });
    });
    it('should work with no storage at all', () => createComponentPickerMemory(undefined).recordAdded('P:x', 5)['P:x'].count.should.equal(1));
});
