// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { SceneElementView } from '@cratis/scene.react';
import { FileUploadHandlerProvider } from '../file';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent } from '../storyElements';

describe('when uploading with a host handler', () => {
    it('should send the selected files and authored server URL through the host boundary', async () => {
        const calls: [File[], string | undefined][] = [];
        const element = sceneComponent('upload', 'fileUpload', { mode: 0, url: '/uploads', multiple: true });
        const { container } = render(
            <PrimeReactProvider>
                <FileUploadHandlerProvider handler={async (files, serverUrl) => { calls.push([files, serverUrl]); }}>
                    <SceneElementView element={element} registry={primeReactComponents} resolveBinding={() => undefined} />
                </FileUploadHandlerProvider>
            </PrimeReactProvider>
        );

        fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [new File(['scene'], 'scene.txt')] } });
        fireEvent.click(screen.getByRole('button', { name: 'Upload selected files' }));

        await waitFor(() => calls.should.have.lengthOf(1));
        const [files, serverUrl] = calls[0]!;
        files.map(file => file.name).should.deep.equal(['scene.txt']);
        (serverUrl ?? '').should.equal('/uploads');
    });
});
