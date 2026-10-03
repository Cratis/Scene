// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { file, renderUpload } from './given/an_upload_surface';

describe('when the upload address is not allowed', () => {
    const fetchSpy = vi.fn();

    beforeEach(() => {
        fetchSpy.mockReset();
        vi.stubGlobal('fetch', fetchSpy);
    });
    afterEach(() => vi.unstubAllGlobals());

    for (const url of ['http://localhost:5180/steal', 'https://evil.example/up', '//evil.example/up', 'javascript:alert(1)', 'data:text/plain,x', 'https://user:pw@localhost/up', '/up\\@evil.example']) {
        describe(`and the address is '${url}'`, () => {
            it('should say so, block every upload, and send nothing to the host handler or the network', async () => {
                const handler = vi.fn();
                const surface = renderUpload({ mode: 0, url }, { handler });

                screen.getByRole('alert').textContent!.should.contain('not allowed');
                surface.choose(file('a.txt'));
                const upload = screen.getByRole('button', { name: 'Upload selected files' }) as HTMLButtonElement;
                upload.disabled.should.equal(true);
                fireEvent.click(upload);
                await new Promise(resolve => setTimeout(resolve, 10));

                handler.mock.calls.length.should.equal(0);
                fetchSpy.mock.calls.length.should.equal(0);
            });

            it('should not upload automatically either', async () => {
                const handler = vi.fn();
                renderUpload({ mode: 'auto', url }, { handler }).choose(file('a.txt'));
                await new Promise(resolve => setTimeout(resolve, 10));
                handler.mock.calls.length.should.equal(0);
                fetchSpy.mock.calls.length.should.equal(0);
            });
        });
    }

    describe('and the host allows that origin', () => {
        it('should send the address to the handler', async () => {
            const handler = vi.fn().mockResolvedValue(undefined);
            renderUpload({ mode: 'auto', url: 'https://files.example/up' }, { handler, allowedOrigins: ['https://files.example'] }).choose(file('a.txt'));
            await vi.waitFor(() => handler.mock.calls.length.should.equal(1));
            handler.mock.calls[0][1].should.equal('https://files.example/up');
        });
    });
});
