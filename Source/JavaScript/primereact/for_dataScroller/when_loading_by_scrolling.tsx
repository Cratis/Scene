// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PrimeDataScroller } from '../data/PrimeDataScroller';
import { sceneComponent } from '../storyElements';
import { ObservedEnd } from './given/an_intersection_observer';

const items = (count: number) => Array.from({ length: count }, (_, index) => `item ${index}`);
const subject = (properties: Record<string, unknown>, isEnabled = true) => render(
    <PrimeDataScroller element={{ ...sceneComponent('s', 'dataScroller', properties), isEnabled }} slots={{}} />
);

describe('when loading by scrolling', () => {
    beforeEach(() => ObservedEnd.install());
    afterEach(() => vi.unstubAllGlobals());

    describe('and the scroller is inline', () => {
        it('should watch the end of its own scrolling container, which is scrollHeight tall', () => {
            const { container } = subject({ items: items(50), rows: 10, inline: true, scrollHeight: 120 });
            const region = screen.getByRole('region');
            ObservedEnd.active.should.have.lengthOf(1);
            (ObservedEnd.active[0].options.root === region).should.equal(true);
            (region.style.maxHeight + region.style.overflowY).should.equal('120pxauto');
            container.querySelectorAll('li').length.should.equal(10);
        });

        it('should be given a height even when none was authored, because without one it never scrolls', () => {
            subject({ items: items(50), inline: true });
            screen.getByRole('region').style.maxHeight.should.equal('320px');
        });

        it('should load the next chunk each time the end is reached, until the list ends', () => {
            const { container } = subject({ items: items(25), rows: 10, inline: true, scrollHeight: 100 });
            act(() => ObservedEnd.reach());
            container.querySelectorAll('li').length.should.equal(20);
            act(() => ObservedEnd.reach());
            container.querySelectorAll('li').length.should.equal(25);
            ObservedEnd.active.should.have.lengthOf(0);
        });

        it('should be reachable by keyboard', () => {
            subject({ items: items(50), inline: true, scrollHeight: 100 });
            screen.getByRole('region').getAttribute('tabindex')!.should.equal('0');
        });
    });

    describe('and the scroller is not inline', () => {
        it('should watch the end against the page, with no height of its own', () => {
            const { container } = subject({ items: items(50), rows: 10, inline: false, scrollHeight: 120 });
            ObservedEnd.active.should.have.lengthOf(1);
            (ObservedEnd.active[0].options.root === null).should.equal(true);
            screen.getByRole('region').style.maxHeight.should.equal('');
            act(() => ObservedEnd.reach());
            container.querySelectorAll('li').length.should.equal(20);
        });
    });

    describe('and the element is disabled', () => {
        it('should load nothing by scrolling', () => {
            const { container } = subject({ items: items(50), rows: 10, inline: true, scrollHeight: 100 }, false);
            ObservedEnd.active.should.have.lengthOf(0);
            act(() => ObservedEnd.reach());
            container.querySelectorAll('li').length.should.equal(10);
        });
    });

    describe('and there is nothing more to load', () => {
        it('should stop watching', () => {
            subject({ items: items(5), rows: 10, inline: true });
            ObservedEnd.active.should.have.lengthOf(0);
        });
    });

    describe('and the browser has no IntersectionObserver', () => {
        it('should still let the button load more', () => {
            vi.stubGlobal('IntersectionObserver', undefined);
            const { container } = subject({ items: items(50), rows: 10, inline: true });
            screen.getByRole('button', { name: 'Load more' });
            container.querySelectorAll('li').length.should.equal(10);
        });
    });
});
