// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme, LayoutMode, MenuTheme, defaultLayoutConfigState, layoutConfigStorageKey, persistLayoutConfig, readPersistedLayoutConfig, withMobile, withMode, withSidebarAnchored } from '../configuration';

class FakeStorage {
    entries = new Map<string, string>();
    getItem(key: string): string | null {
        return this.entries.has(key) ? this.entries.get(key)! : null;
    }

    setItem(key: string, value: string): void {
        this.entries.set(key, value);
    }
}

function storageWith(raw: string): Storage {
    const storage = new FakeStorage();
    storage.setItem(layoutConfigStorageKey, raw);
    return storage as unknown as Storage;
}

describe('when restoring a persisted configuration', () => {
    it('should fall back to the defaults when nothing was persisted', () => {
        readPersistedLayoutConfig(new FakeStorage() as unknown as Storage).should.deep.equal(defaultLayoutConfigState());
    });

    it('should fall back to the defaults when there is no storage at all', () => {
        readPersistedLayoutConfig(undefined).should.deep.equal(defaultLayoutConfigState());
    });

    it('should round-trip the preferences that are worth keeping', () => {
        const storage = new FakeStorage() as unknown as Storage;
        const chosen = withSidebarAnchored(withMode(defaultLayoutConfigState(), LayoutMode.Drawer), true);
        persistLayoutConfig(chosen, storage);

        const restored = readPersistedLayoutConfig(storage);
        restored.mode.should.equal(LayoutMode.Drawer);
        restored.isSidebarAnchored.should.be.true;
    });

    it('should not restore the transient state', () => {
        const storage = new FakeStorage() as unknown as Storage;
        persistLayoutConfig(withMobile(defaultLayoutConfigState(), true), storage);
        readPersistedLayoutConfig(storage).isMobile.should.be.false;
    });

    it('should ignore an unrecognized mode rather than putting a class no rule matches on the wrapper', () => {
        readPersistedLayoutConfig(storageWith('{"mode":"kaleidoscope"}')).mode.should.equal(defaultLayoutConfigState().mode);
    });

    it('should ignore an unrecognized menu theme and color scheme', () => {
        const restored = readPersistedLayoutConfig(storageWith('{"menuTheme":"neon","colorScheme":"sepia"}'));
        restored.menuTheme.should.equal(MenuTheme.Light);
        restored.colorScheme.should.equal(ColorScheme.Light);
    });

    it('should survive malformed json', () => {
        readPersistedLayoutConfig(storageWith('{ not json')).should.deep.equal(defaultLayoutConfigState());
    });

    it('should survive json that is not an object', () => {
        readPersistedLayoutConfig(storageWith('[1,2,3]')).should.deep.equal(defaultLayoutConfigState());
    });

    it('should not throw when storage refuses to write', () => {
        const refusing = {
            getItem: () => null,
            setItem: () => {
                throw new Error('QuotaExceededError');
            },
        } as unknown as Storage;

        (() => persistLayoutConfig(defaultLayoutConfigState(), refusing)).should.not.throw();
    });
});
