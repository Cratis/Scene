// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createWindowSizeMemory, type WindowSizeStorage } from '../windowSizeMemory';

const storageOf = (items: Record<string, string> = {}): WindowSizeStorage & { items: Record<string, string> } => ({
    items,
    getItem: key => key in items ? items[key] : null,
    setItem: (key, value) => { items[key] = value; },
});

describe('when a window size is remembered for a screen', () => {
    const storage = storageOf();
    const memory = createWindowSizeMemory(storage);
    memory.write('slice-1:role-a', { width: 1111.4, height: 777.6 });

    it('should read it back, in whole pixels', () => memory.read('slice-1:role-a')!.should.deep.equal({ width: 1111, height: 778 }));
    it('should not give it to another screen', () => (memory.read('slice-2:role-a') === undefined).should.be.true);
    it('should keep it as the last size used', () => memory.readLastUsed()!.should.deep.equal({ width: 1111, height: 778 }));
    it('should be kept in the browser, not the screen', () => Object.keys(storage.items).every(key => key.startsWith('studio.screenEditor.windowSize')).should.be.true);
});

describe('when a second screen is remembered', () => {
    const memory = createWindowSizeMemory(storageOf());
    memory.write('a', { width: 1000, height: 600 });
    memory.write('b', { width: 1200, height: 800 });

    it('should keep each screen its own size', () => { memory.read('a')!.width.should.equal(1000); memory.read('b')!.width.should.equal(1200); });
    it('should report the most recent as the last used', () => memory.readLastUsed()!.width.should.equal(1200));
});

describe('when what is stored is damaged', () => {
    const key = 'studio.screenEditor.windowSize.v1:x';
    for (const [name, text] of [['not json', '{'], ['a string', '"wide"'], ['a negative size', '{"width":-1,"height":4}'], ['missing a side', '{"width":400}'], ['null', 'null']] as const)
        it(`should read nothing from ${name}`, () => (createWindowSizeMemory(storageOf({ [key]: text })).read('x') === undefined).should.be.true);
});

describe('when there is no storage, or it refuses', () => {
    const refusing: WindowSizeStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } };

    it('should forget quietly without storage', () => {
        const memory = createWindowSizeMemory(undefined);
        memory.write('a', { width: 1, height: 1 });
        (memory.read('a') === undefined && memory.readLastUsed() === undefined).should.be.true;
    });
    it('should forget quietly when storage throws', () => {
        const memory = createWindowSizeMemory(refusing);
        memory.write('a', { width: 1000, height: 600 });
        (memory.read('a') === undefined && memory.readLastUsed() === undefined).should.be.true;
    });
});
