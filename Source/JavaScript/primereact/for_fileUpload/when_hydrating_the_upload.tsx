// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, screen, waitFor } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { PrimeReactProvider } from '@primereact/core';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent } from '../storyElements';

describe('when hydrating the upload', () => {
    it('should hydrate a server render of an absolute address on the page origin without a mismatch, and then accept it', async () => {
        const element = sceneComponent('upload', 'fileUpload', { mode: 0, url: `${window.location.origin}/uploads` });
        const tree = <PrimeReactProvider><SceneElementView element={element} registry={primeReactComponents} resolveBinding={() => undefined} /></PrimeReactProvider>;
        const container = document.body.appendChild(document.createElement('div'));
        container.innerHTML = renderToString(tree);

        const serverButton = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Upload selected files');
        const serverButtonWasDisabled = serverButton?.disabled;
        const problems: unknown[][] = [];
        const original = console.error;
        console.error = (...message: unknown[]) => { problems.push(message); };
        let root: Root | undefined;
        try {
            await act(async () => { root = hydrateRoot(container, tree); });
            await waitFor(() => (screen.getByRole('button', { name: 'Upload selected files' }) as HTMLButtonElement).disabled.should.equal(false));
            (screen.queryByRole('alert')?.textContent ?? '').should.equal('');
        } finally {
            console.error = original;
            await act(async () => { root?.unmount(); });
            container.remove();
        }

        // The server cannot know the page origin, so it never accepts an absolute address; the client does, after hydrating.
        (serverButton === undefined).should.equal(false);
        serverButtonWasDisabled!.should.equal(true);
        problems.map(message => String(message[0])).filter(text => /hydrat|did not match|mismatch/i.test(text)).should.deep.equal([]);
    });
});
