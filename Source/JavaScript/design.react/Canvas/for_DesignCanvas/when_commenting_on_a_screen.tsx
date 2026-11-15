// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { aStartedDesign, sessionOf } from '../../given/aStartedDesign';
import { askTheChat } from '../../given/canvasInteractions';
import type { FakeDesignHost } from '../../Testing/createFakeDesignHost';
import { DesignCanvas } from '../DesignCanvas';

const rect = (left: number, top: number, width: number, height: number): DOMRect =>
    ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) });

const drawElementsAt = (box: DOMRect) => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
        return this.hasAttribute('data-scene-id') ? box : rect(0, 0, 480, 600);
    };
    return () => { HTMLElement.prototype.getBoundingClientRect = original; };
};

describe('when commenting on a screen', () => {
    let fake: FakeDesignHost;
    let restore: () => void;

    beforeEach(async () => {
        restore = drawElementsAt(rect(100, 100, 200, 100));
        fake = aStartedDesign();
        render(<DesignCanvas host={fake.host} />);
        await askTheChat('Add a screen called Home', 'I added Home.');
    });

    afterEach(() => restore());

    describe('and the pin is dropped over an element', () => {
        beforeEach(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Add comment' }));
            const capture = document.querySelector('[data-capture]') as HTMLElement;
            fireEvent.click(capture, { clientX: 150, clientY: 150 });
            fireEvent.change(await screen.findByRole('textbox', { name: 'Add comment' }), { target: { value: 'Too wide' } });
            fireEvent.submit(screen.getByRole('textbox', { name: 'Add comment' }).closest('form')!);
            await waitFor(() => sessionOf(fake).comments.length.should.equal(1));
        });

        it('should anchor the comment to the element, by its id', () => (sessionOf(fake).comments[0]!.elementId !== undefined).should.equal(true));
        it('should pin no position, since an element is under the pin', () => (sessionOf(fake).comments[0]!.position === undefined).should.equal(true));
        it('should record who wrote it', () => sessionOf(fake).comments[0]!.author.should.equal('ada'));
        it('should draw a numbered pin on the screen', async () => (await screen.findByRole('button', { name: 'Comment 1: Too wide' })).textContent!.should.equal('1'));
        it('should list the comment', () => Boolean(screen.getAllByText('Too wide')[0]).should.equal(true));
    });

    describe('and the pin is dropped where no element is', () => {
        beforeEach(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Add comment' }));
            fireEvent.click(document.querySelector('[data-capture]') as HTMLElement, { clientX: 20, clientY: 30 });
            fireEvent.change(await screen.findByRole('textbox', { name: 'Add comment' }), { target: { value: 'Needs air' } });
            fireEvent.submit(screen.getByRole('textbox', { name: 'Add comment' }).closest('form')!);
            await waitFor(() => sessionOf(fake).comments.length.should.equal(1));
        });

        it('should pin the comment where it was put', () => sessionOf(fake).comments[0]!.position!.should.deep.equal({ x: 20, y: 30 }));
        it('should anchor it to no element', () => (sessionOf(fake).comments[0]!.elementId === undefined).should.equal(true));
    });

    describe('and a comment is resolved', () => {
        beforeEach(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Add comment' }));
            fireEvent.click(document.querySelector('[data-capture]') as HTMLElement, { clientX: 150, clientY: 150 });
            fireEvent.change(await screen.findByRole('textbox', { name: 'Add comment' }), { target: { value: 'Done soon' } });
            fireEvent.submit(screen.getByRole('textbox', { name: 'Add comment' }).closest('form')!);
            await waitFor(() => sessionOf(fake).comments.length.should.equal(1));
            fireEvent.click(await screen.findByRole('button', { name: 'Resolve' }));
            await waitFor(() => sessionOf(fake).comments[0]!.resolved.should.equal(true));
        });

        it('should keep it, marked resolved', () => sessionOf(fake).comments[0]!.resolved.should.equal(true));
        it('should offer to reopen it', async () => Boolean(await screen.findByRole('button', { name: 'Reopen' })).should.equal(true));
    });

    describe('and no pin is dropped', () => {
        it('should say there are no comments', () => { fireEvent.click(screen.getByRole('tab', { name: 'Comments' })); Boolean(screen.getByText('No comments on this screen.')).should.equal(true); });
    });
});
