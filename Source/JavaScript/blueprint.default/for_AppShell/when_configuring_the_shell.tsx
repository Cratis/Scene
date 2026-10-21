// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { LayoutMode } from '../configuration';
import { GalleryScreenPreview } from '../gallery/GalleryScreenPreview';
import { provideBrowserApis } from '../for_templatePreviewStates/given';

const wrapper = () => document.querySelector('.layout-wrapper')!;

describe('when configuring the shell without a widget provider', () => {
    beforeEach(provideBrowserApis);


    it('should toggle the sidebar from its topbar button', () => {
        render(<GalleryScreenPreview screenName='RecordPage' initialConfig={{ mode: LayoutMode.Static }} />);
        const before = wrapper().className;
        fireEvent.click(screen.getByRole('button', { name: 'Close the menu' }));
        wrapper().className.should.not.equal(before);
    });

    it('should pin and unpin a pointer-revealed sidebar', () => {
        render(<GalleryScreenPreview screenName='RecordPage' initialConfig={{ mode: LayoutMode.Reveal }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Pin the menu open' }));
        wrapper().classList.contains('layout-sidebar-anchored').should.equal(true);
        screen.getByRole('button', { name: 'Unpin the menu' }).getAttribute('aria-pressed')!.should.equal('true');
        fireEvent.click(screen.getByRole('button', { name: 'Unpin the menu' }));
        wrapper().classList.contains('layout-sidebar-anchored').should.equal(false);
    });

    it('should keep the configurator open and update both its portal and the page when switching theme', async () => {
        render(<GalleryScreenPreview screenName='RecordPage' />);
        fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
        const dialog = await screen.findByRole('dialog', { name: 'Settings' });
        fireEvent.click(within(within(dialog).getByRole('group', { name: 'Theme' })).getByRole('button', { name: 'Scene Default Dark' }));
        await waitFor(() => wrapper().classList.contains('layout-color-scheme-dark').should.equal(true));
        await waitFor(() => dialog.closest('[data-scene-color-scheme]')!.getAttribute('data-scene-color-scheme')!.should.equal('dark'));
        within(within(dialog).getByRole('group', { name: 'Theme' })).getByRole('button', { name: 'Scene Default Dark' }).getAttribute('aria-pressed')!.should.equal('true');
    });

    it('should switch modes without dismissing the configurator', async () => {
        render(<GalleryScreenPreview screenName='RecordPage' initialConfig={{ mode: LayoutMode.Reveal }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
        const dialog = await screen.findByRole('dialog', { name: 'Settings' });
        fireEvent.click(within(within(dialog).getByRole('group', { name: 'Menu mode' })).getByRole('button', { name: /^Static$/ }));
        wrapper().classList.contains('layout-static').should.equal(true);
        (screen.getByRole('dialog', { name: 'Settings' }) === dialog).should.equal(true);
    });

    it('should restore focus to the settings trigger when closed', async () => {
        render(<GalleryScreenPreview screenName='RecordPage' />);
        const trigger = screen.getByRole('button', { name: 'Settings' });
        trigger.focus();
        fireEvent.click(trigger);
        const dialog = await screen.findByRole('dialog', { name: 'Settings' });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Close Settings' }));
        await waitFor(() => (screen.queryByRole('dialog') === null).should.equal(true));
        await waitFor(() => (document.activeElement === trigger).should.equal(true));
    });
});
