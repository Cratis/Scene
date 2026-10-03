// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { file, renderUpload } from './given/an_upload_surface';

describe('when selecting files', () => {
    const settle = () => new Promise(resolve => setTimeout(resolve, 20));

    describe('and several are not allowed', () => {
        it('should refuse two files from the input before the handler is called, and say so', async () => {
            const handler = vi.fn().mockResolvedValue(undefined);
            const surface = renderUpload({ mode: 'auto', multiple: false }, { handler });

            surface.choose(file('a.txt'), file('b.txt'));
            await settle();

            handler.mock.calls.length.should.equal(0);
            screen.getByRole('alert').textContent!.should.equal('Only one file can be uploaded at a time.');
            surface.input.value.should.equal('');
        });

        it('should refuse two dropped files before the handler is called, and say so', async () => {
            const handler = vi.fn().mockResolvedValue(undefined);
            const surface = renderUpload({ mode: 'auto' }, { handler });

            surface.drop(file('a.txt'), file('b.txt'));
            await settle();

            handler.mock.calls.length.should.equal(0);
            screen.getByRole('alert').textContent!.should.equal('Only one file can be uploaded at a time.');
        });

        it('should accept one file from the input and one dropped file', async () => {
            const handler = vi.fn().mockResolvedValue(undefined);
            const surface = renderUpload({ mode: 'auto' }, { handler });

            surface.choose(file('a.txt'));
            await screen.findByText('1 file uploaded.');
            handler.mock.calls.length.should.equal(1);
            surface.drop(file('b.txt'));
            await vi.waitFor(() => handler.mock.calls.length.should.equal(2));
        });
    });

    describe('and several are allowed', () => {
        it('should send both selected and both dropped files', async () => {
            const sent: string[][] = [];
            const surface = renderUpload({ mode: 'auto', multiple: true }, { handler: async files => { sent.push(files.map(selected => selected.name)); } });

            surface.choose(file('a.txt'), file('b.txt'));
            await screen.findByText('2 files uploaded.');
            surface.drop(file('c.txt'), file('d.txt'));
            await vi.waitFor(() => sent.length.should.equal(2));
            sent.should.deep.equal([['a.txt', 'b.txt'], ['c.txt', 'd.txt']]);
        });
    });

    describe('and a file does not meet the requirements', () => {
        it('should say why and not call the handler, for a type and for a size', async () => {
            const handler = vi.fn().mockResolvedValue(undefined);
            const surface = renderUpload({ mode: 'auto', accept: 'image/*', maxFileSize: 10 }, { handler });

            surface.choose(file('notes.txt', 'text/plain', 5));
            (await screen.findByRole('alert')).textContent!.should.contain('Invalid file type');
            surface.choose(file('big.png', 'image/png', 50));
            await vi.waitFor(() => screen.getByRole('alert').textContent!.should.contain('Invalid file size'));

            handler.mock.calls.length.should.equal(0);
        });
    });
});
