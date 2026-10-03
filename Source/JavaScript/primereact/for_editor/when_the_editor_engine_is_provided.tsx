// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { StrictMode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { PrimeEditor } from '../editor/PrimeEditor';
import { QuillLoaderProvider } from '../editor/QuillLoaderProvider';
import { sceneComponent } from '../storyElements';
import { FakeQuill, fakeQuillLoader } from './given/FakeQuill';
import { forbiddenInOutput, hostileHtml } from './given/hostile_html';

type Properties = Record<string, unknown>;

function editorElement(properties: Properties, isEnabled = true) {
    return { ...sceneComponent('editor', 'editor', properties), isEnabled };
}

function Subject({ properties, isEnabled = true, onChange, strict = false }: { properties: Properties; isEnabled?: boolean; onChange?: () => void; strict?: boolean }) {
    const subject = (
        <QuillLoaderProvider loader={fakeQuillLoader}>
            <PrimeEditor element={editorElement(properties, isEnabled)} slots={{}} interactions={{ onChange }} />
        </QuillLoaderProvider>
    );
    return strict ? <StrictMode>{subject}</StrictMode> : subject;
}

/** Waits until the editor is built and React has committed it: its status is shown and the read-only view is gone. */
const ready = () => waitFor(() => {
    FakeQuill.live.should.have.lengthOf(1);
    screen.getByText(/characters$|^Read only$|^Disabled$/);
});

describe('when the editor engine is provided', () => {
    beforeEach(() => { FakeQuill.instances = []; });

    describe('and the editor mounts', () => {
        const changes: string[] = [];
        let element: ReturnType<typeof editorElement>;
        let before: string;

        beforeEach(async () => {
            changes.length = 0;
            element = editorElement({ value: hostileHtml, placeholder: 'Write here', ariaLabel: 'Notes' });
            before = JSON.stringify(element.properties);
            render(
                <QuillLoaderProvider loader={fakeQuillLoader}>
                    <PrimeEditor element={element} slots={{}} interactions={{ onChange: () => changes.push('change') }} />
                </QuillLoaderProvider>
            );
            await ready();
        });

        it('should build one editor, in a container React does not own, with the options it was given', () => {
            FakeQuill.instances.should.have.lengthOf(1);
            FakeQuill.latest.options.placeholder!.should.equal('Write here');
            FakeQuill.latest.options.readOnly.should.equal(false);
            (FakeQuill.latest.container.closest('[data-scene-id]') !== null).should.equal(true);
            FakeQuill.latest.container.parentElement!.children.length.should.be.greaterThan(1);
        });

        it('should load the content only after the allowlist, and silently', () => {
            const [call] = FakeQuill.latest.setContentsCalls;
            call.source!.should.equal('silent');
            call.html.should.contain('<p>hi</p>');
            for (const forbidden of forbiddenInOutput) call.html.toLowerCase().should.not.contain(forbidden.toLowerCase());
        });

        it('should not report loading the document as the user editing it', () => {
            changes.should.deep.equal([]);
        });

        it('should show the editor in place of the read-only view, named and marked as a text box', async () => {
            (document.querySelector('[data-scene-part="read-only-content"]') === null).should.equal(true);
            await waitFor(() => FakeQuill.latest.root.getAttribute('aria-label')!.should.equal('Notes'));
            FakeQuill.latest.root.getAttribute('role')!.should.equal('textbox');
            FakeQuill.latest.root.getAttribute('aria-multiline')!.should.equal('true');
        });

        it('should leave the authored value as it was', () => {
            JSON.stringify(element.properties).should.equal(before);
        });

        it('should report a user edit, once, and count the characters', async () => {
            act(() => FakeQuill.latest.type('abc'));
            changes.should.deep.equal(['change']);
            await waitFor(() => screen.getByText(`${FakeQuill.latest.getText().length - 1} characters`));
        });

        it('should not report an edit the document made', () => {
            act(() => FakeQuill.latest.type('x', 'api'));
            act(() => FakeQuill.latest.type('y', 'silent'));
            changes.should.deep.equal([]);
        });
    });

    describe('and an unrelated property changes', () => {
        it('should keep the same editor and what the user typed, and update in place', async () => {
            const { rerender } = render(<Subject properties={{ value: '<p>base</p>', placeholder: 'One', ariaLabel: 'A' }} />);
            await ready();
            const editor = FakeQuill.latest;
            act(() => editor.type('TYPED'));

            rerender(<Subject properties={{ value: '<p>base</p>', placeholder: 'Two', ariaLabel: 'B' }} />);
            await new Promise(resolve => setTimeout(resolve, 20));

            FakeQuill.instances.should.have.lengthOf(1);
            editor.root.textContent!.should.equal('baseTYPED');
            editor.setContentsCalls.should.have.lengthOf(1);
            editor.root.getAttribute('data-placeholder')!.should.equal('Two');
            editor.root.getAttribute('aria-label')!.should.equal('B');
            editor.listeners.size.should.equal(1);
        });
    });

    describe('and the authored value really changes', () => {
        it('should replace the content silently and report no edit', async () => {
            const changes: string[] = [];
            const { rerender } = render(<Subject properties={{ value: '<p>one</p>' }} onChange={() => changes.push('change')} />);
            await ready();
            rerender(<Subject properties={{ value: '<p>two</p>' }} onChange={() => changes.push('change')} />);

            await waitFor(() => FakeQuill.latest.root.textContent!.should.equal('two'));
            FakeQuill.latest.setContentsCalls.map(call => call.source).should.deep.equal(['silent', 'silent']);
            changes.should.deep.equal([]);
            FakeQuill.instances.should.have.lengthOf(1);
        });
    });

    describe('and the control is read only or disabled', () => {
        it('should disable the editor and its toolbar, and enable them again when that changes', async () => {
            const { rerender } = render(<Subject properties={{ value: 'x', readOnly: true }} />);
            await ready();
            const editor = FakeQuill.latest;
            editor.options.readOnly.should.equal(true);
            await waitFor(() => editor.enabled.should.equal(false));
            editor.toolbar.querySelectorAll('[disabled]').length.should.equal(2);
            screen.getByText('Read only');

            rerender(<Subject properties={{ value: 'x', readOnly: false }} isEnabled={false} />);
            await waitFor(() => screen.getByText('Disabled'));
            editor.enabled.should.equal(false);
            editor.root.getAttribute('aria-readonly')!.should.equal('true');

            rerender(<Subject properties={{ value: 'x', readOnly: false }} />);
            await waitFor(() => editor.enabled.should.equal(true));
            editor.toolbar.querySelectorAll('[disabled]').length.should.equal(0);
        });
    });

    describe('and the toolbar setting changes', () => {
        it('should rebuild the editor and leave nothing of the first behind', async () => {
            const { rerender } = render(<Subject properties={{ value: 'x', showHeader: true }} />);
            await ready();
            const first = FakeQuill.latest;

            rerender(<Subject properties={{ value: 'x', showHeader: false }} />);
            await waitFor(() => FakeQuill.instances.should.have.lengthOf(2));

            first.listeners.size.should.equal(0);
            first.container.isConnected.should.equal(false);
            first.toolbar.isConnected.should.equal(false);
            FakeQuill.latest.options.modules.toolbar.should.equal(false);
            document.querySelectorAll('.fake-toolbar').length.should.equal(0);
            FakeQuill.live.should.have.lengthOf(1);
        });
    });

    describe('and the control unmounts', () => {
        it('should remove its listener and its editor', async () => {
            const { unmount } = render(<Subject properties={{ value: 'x' }} />);
            await ready();
            const editor = FakeQuill.latest;
            unmount();
            editor.listeners.size.should.equal(0);
            editor.container.isConnected.should.equal(false);
        });
    });

    describe('and React runs effects twice', () => {
        it('should end with exactly one live editor and one listener', async () => {
            render(<Subject properties={{ value: 'x' }} strict />);
            await waitFor(() => FakeQuill.live.should.have.lengthOf(1));
            await new Promise(resolve => setTimeout(resolve, 20));
            FakeQuill.live.should.have.lengthOf(1);
            FakeQuill.live[0].listeners.size.should.equal(1);
            document.querySelectorAll('.fake-editor').length.should.equal(1);
        });
    });

    describe('and loading the engine fails', () => {
        it('should keep the content visible and say why editing is unavailable', async () => {
            render(
                <QuillLoaderProvider loader={() => Promise.reject(new Error("Failed to resolve import 'quill'"))}>
                    <PrimeEditor element={editorElement({ value: '<p>Kept</p>' })} slots={{}} />
                </QuillLoaderProvider>
            );
            (await screen.findByRole('alert')).textContent!.should.contain("Failed to resolve import 'quill'");
            screen.getByRole('textbox').textContent!.should.equal('Kept');
        });
    });
});
