// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { file, renderUpload } from './given/an_upload_surface';

describe('when uploading with a host handler', () => {
    it('should send the selected files and the checked server address through the host boundary', async () => {
        const calls: [File[], string | undefined][] = [];
        const surface = renderUpload({ mode: 0, url: '/uploads', multiple: true }, { handler: async (files, serverUrl) => { calls.push([files, serverUrl]); } });

        surface.choose(file('scene.txt'));
        fireEvent.click(screen.getByRole('button', { name: 'Upload selected files' }));

        await waitFor(() => calls.should.have.lengthOf(1));
        const [files, serverUrl] = calls[0]!;
        files.map(selected => selected.name).should.deep.equal(['scene.txt']);
        serverUrl!.should.equal('/uploads');
        await screen.findByText('1 file uploaded.');
    });

    it('should call the handler without an address when none was authored', async () => {
        const calls: (string | undefined)[] = [];
        const surface = renderUpload({ mode: 'auto' }, { handler: async (_files, serverUrl) => { calls.push(serverUrl); } });

        surface.choose(file('a.txt'));

        await waitFor(() => calls.should.deep.equal([undefined]));
    });

    it('should clear the selection once the files were sent', async () => {
        const surface = renderUpload({ mode: 0 }, { handler: async () => undefined });
        surface.choose(file('a.txt'));
        const upload = screen.getByRole('button', { name: 'Upload selected files' });
        (upload as HTMLButtonElement).disabled.should.equal(false);

        fireEvent.click(upload);

        await waitFor(() => (screen.getByRole('button', { name: 'Upload selected files' }) as HTMLButtonElement).disabled.should.equal(true));
    });
});
