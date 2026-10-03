// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { file, renderUpload } from './given/an_upload_surface';

describe('when the handler fails', () => {
    const unhandled: unknown[] = [];
    const record = (reason: unknown) => unhandled.push(reason);

    beforeEach(() => { unhandled.length = 0; process.on('unhandledRejection', record); });
    afterEach(() => process.off('unhandledRejection', record));

    it('should report the failure, keep the selection, and let the user try again', async () => {
        let attempts = 0;
        const surface = renderUpload({ mode: 0 }, { handler: async () => { attempts++; if (attempts === 1) throw new Error('boom'); } });
        surface.choose(file('a.txt'));
        fireEvent.click(screen.getByRole('button', { name: 'Upload selected files' }));

        (await screen.findByRole('alert')).textContent!.should.equal('Upload failed: boom');
        await new Promise(resolve => setTimeout(resolve, 20));
        unhandled.length.should.equal(0);

        fireEvent.click(screen.getByRole('button', { name: 'Upload selected files' }));
        await screen.findByText('1 file uploaded.');
        attempts.should.equal(2);
    });

    it('should report a handler that rejects with something that is not an error', async () => {
        renderUpload({ mode: 'auto' }, { handler: () => Promise.reject('plain text') }).choose(file('a.txt'));
        (await screen.findByRole('alert')).textContent!.should.equal('Upload failed: plain text');
    });

    it('should not start a second upload while the first runs', async () => {
        let calls = 0;
        let finish!: () => void;
        renderUpload({ mode: 'auto' }, { handler: () => { calls++; return new Promise<void>(resolve => { finish = resolve; }); } }).choose(file('a.txt'));
        await waitFor(() => calls.should.equal(1));
        screen.getByText('Uploading…');
        finish();
        await screen.findByText('1 file uploaded.');
        calls.should.equal(1);
    });
});
