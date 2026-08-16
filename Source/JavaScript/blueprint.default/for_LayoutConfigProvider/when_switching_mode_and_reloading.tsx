// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ExternalComponent, HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { LayoutConfigProvider, LayoutMode, layoutConfigStorageKey, readPersistedLayoutConfig, useLayoutConfig } from '../configuration';
import { LayoutModeSwitcher } from '../shell';

class FakeStorage {
    entries = new Map<string, string>();
    getItem(key: string): string | null {
        return this.entries.has(key) ? this.entries.get(key)! : null;
    }

    setItem(key: string, value: string): void {
        this.entries.set(key, value);
    }
}

const switcherElement: ExternalComponent = {
    id: 'mode-switcher',
    name: 'mode-switcher',
    properties: {},
    visibility: Visibility.Visible,
    isEnabled: true,
    opacity: 1,
    size: {},
    zIndex: 0,
    minimumSize: {},
    maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 },
    horizontalAlignment: HorizontalAlignment.Stretch,
    verticalAlignment: VerticalAlignment.Stretch,
    componentName: 'layoutModeSwitcher',
    slots: {},
};

function CurrentMode() {
    const { config, effectiveMode } = useLayoutConfig();
    return <output data-testid='mode'>{`${config.mode}/${effectiveMode}`}</output>;
}

describe('when switching mode and reloading', () => {
    let storage: FakeStorage;

    beforeEach(async () => {
        storage = new FakeStorage();
        render(
            <LayoutConfigProvider storage={storage as unknown as Storage}>
                <LayoutModeSwitcher element={switcherElement} slots={{}} />
                <CurrentMode />
            </LayoutConfigProvider>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Drawer' }));
    });

    it('should apply the chosen mode immediately', () => {
        screen.getByTestId('mode').textContent!.should.equal(`${LayoutMode.Drawer}/${LayoutMode.Drawer}`);
    });

    it('should mark the chosen mode as pressed', () => {
        screen.getByRole('button', { name: 'Drawer' }).getAttribute('aria-pressed')!.should.equal('true');
    });

    it('should persist the choice under the storage key', () => {
        storage.getItem(layoutConfigStorageKey)!.should.contain(LayoutMode.Drawer);
    });

    it('should come back with the same mode after a reload', () => {
        readPersistedLayoutConfig(storage as unknown as Storage).mode.should.equal(LayoutMode.Drawer);
    });

    it('should not persist whether the sidebar happened to be open', () => {
        storage.getItem(layoutConfigStorageKey)!.should.not.contain('isSidebarOpen');
    });
});
