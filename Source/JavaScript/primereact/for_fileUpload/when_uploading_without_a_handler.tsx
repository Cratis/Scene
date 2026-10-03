// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { file, renderUpload } from './given/an_upload_surface';

describe('when uploading without a handler', () => {
    const fetchSpy = vi.fn();
    const unhandled: unknown[] = [];
    const record = (reason: unknown) => unhandled.push(reason);

    beforeEach(() => {
        fetchSpy.mockReset();
        unhandled.length = 0;
        process.on('unhandledRejection', record);
        vi.stubGlobal('fetch', fetchSpy);
    });
    afterEach(() => {
        process.off('unhandledRejection', record);
        vi.unstubAllGlobals();
    });

    it('should request nothing just because the control mounted', async () => {
        renderUpload({ mode: 'auto', url: '/uploads' });
        await new Promise(resolve => setTimeout(resolve, 20));
        fetchSpy.mock.calls.length.should.equal(0);
    });

    it('should post the files to the checked address, with cookies for the page origin only and without following redirects', async () => {
        fetchSpy.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });
        const surface = renderUpload({ mode: 0, url: '/uploads', name: 'attachment', multiple: true });
        surface.choose(file('a.txt'), file('b.txt'));
        fireEvent.click(screen.getByRole('button', { name: 'Upload selected files' }));

        await waitFor(() => fetchSpy.mock.calls.length.should.equal(1));
        const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
        url.should.equal('/uploads');
        init.method!.should.equal('POST');
        init.credentials!.should.equal('same-origin');
        init.redirect!.should.equal('error');
        (init.body as FormData).getAll('attachment').map(entry => (entry as File).name).should.deep.equal(['a.txt', 'b.txt']);
        await screen.findByText('2 files uploaded.');
    });

    it('should start one upload for a double click, not two', async () => {
        let finish!: () => void;
        fetchSpy.mockReturnValue(new Promise(resolve => { finish = () => resolve({ ok: true, status: 200, statusText: 'OK' }); }));
        const surface = renderUpload({ mode: 0, url: '/uploads' });
        surface.choose(file('a.txt'));
        const upload = screen.getByRole('button', { name: 'Upload selected files' });

        fireEvent.click(upload);
        fireEvent.click(upload);
        fireEvent.doubleClick(upload);
        await waitFor(() => (screen.getByRole('button', { name: 'Upload selected files' }) as HTMLButtonElement).disabled.should.equal(true));
        fireEvent.click(screen.getByRole('button', { name: 'Upload selected files' }));
        finish();

        await screen.findByText('1 file uploaded.');
        fetchSpy.mock.calls.length.should.equal(1);
    });

    it('should show a failure and keep the selection so it can be retried', async () => {
        fetchSpy.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });
        const surface = renderUpload({ mode: 0, url: '/uploads' });
        surface.choose(file('a.txt'));
        fireEvent.click(screen.getByRole('button', { name: 'Upload selected files' }));

        (await screen.findByRole('alert')).textContent!.should.contain('Upload failed: The server answered 500 Server Error.');
        (screen.getByRole('button', { name: 'Upload selected files' }) as HTMLButtonElement).disabled.should.equal(false);

        fetchSpy.mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK' });
        fireEvent.click(screen.getByRole('button', { name: 'Upload selected files' }));
        await screen.findByText('1 file uploaded.');
        fetchSpy.mock.calls.length.should.equal(2);
    });

    it('should show a network failure as well, without an unhandled rejection', async () => {
        fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));
        renderUpload({ mode: 'auto', url: '/uploads' }).choose(file('a.txt'));

        (await screen.findByRole('alert')).textContent!.should.contain('Failed to fetch');
        await new Promise(resolve => setTimeout(resolve, 20));
        unhandled.length.should.equal(0);
    });

    it('should clear the failure when a new selection is made', async () => {
        fetchSpy.mockResolvedValueOnce({ ok: false, status: 503, statusText: '' });
        const surface = renderUpload({ mode: 0, url: '/uploads' });
        surface.choose(file('a.txt'));
        fireEvent.click(screen.getByRole('button', { name: 'Upload selected files' }));
        await screen.findByRole('alert');

        surface.choose(file('b.txt'));

        await waitFor(() => (screen.queryByRole('alert') === null).should.equal(true));
    });

    it('should say that it has nowhere to send files when there is no address and no handler', () => {
        renderUpload({ mode: 0 });
        screen.getByText(/Configure a server URL or provide an upload handler/);
        (screen.getByRole('button', { name: 'Upload selected files' }) as HTMLButtonElement).disabled.should.equal(true);
    });
});
