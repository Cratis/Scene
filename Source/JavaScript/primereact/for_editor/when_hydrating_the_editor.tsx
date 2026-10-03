// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, screen, waitFor } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { PrimeEditor } from '../editor/PrimeEditor';
import { QuillLoaderProvider } from '../editor/QuillLoaderProvider';
import { sceneComponent } from '../storyElements';
import { FakeQuill, fakeQuillLoader } from './given/FakeQuill';
import { hostileHtml } from './given/hostile_html';

describe('when hydrating the editor', () => {
    it('should hydrate server markup without a mismatch, then become the editor', async () => {
        FakeQuill.instances = [];
        const element = sceneComponent('editor', 'editor', { value: `<p>Release <strong>notes</strong></p>${hostileHtml}`, ariaLabel: 'Notes' });
        const tree = <QuillLoaderProvider loader={fakeQuillLoader}><PrimeEditor element={element} slots={{}} /></QuillLoaderProvider>;
        const container = document.body.appendChild(document.createElement('div'));
        container.innerHTML = renderToString(tree);
        const serverText = container.textContent;

        const problems: unknown[][] = [];
        const original = console.error;
        console.error = (...message: unknown[]) => { problems.push(message); };
        try {
            await act(async () => { hydrateRoot(container, tree); });
            await waitFor(() => FakeQuill.live.should.have.lengthOf(1));
        } finally {
            console.error = original;
        }

        serverText!.should.contain('Release notes');
        problems.map(message => String(message[0])).filter(text => /hydrat|did not match|mismatch/i.test(text)).should.deep.equal([]);
        (screen.queryByText(/Rich-text editing is not available/) === null).should.equal(true);
        container.remove();
    });
});
