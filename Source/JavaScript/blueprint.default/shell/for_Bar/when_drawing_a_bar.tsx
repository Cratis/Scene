// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import type { ExternalComponent } from '@cratis/scene.model';
import { Bar } from '../Bar';

const bar = { id: 'bar', name: 'bar', componentName: 'Cratis.Blueprint.Default:bar', properties: {}, slots: {} } as unknown as ExternalComponent;

// An application's own shell puts a bar in its topbar slot: no sidebar, no layout configuration, nothing but what the slots hold.
describe('when drawing a bar', () => {
    afterEach(cleanup);

    describe('without a shell around it', () => {
        beforeEach(() => {
            render(<Bar element={bar} slots={{ start: [<b key='s'>Brand</b>], end: [<i key='e'>Basket</i>] }} />);
        });

        it('should draw the brand at the start', () => document.querySelector('.shell-bar-start')!.textContent!.should.equal('Brand'));
        it('should draw the actions at the end', () => document.querySelector('.shell-bar-end')!.textContent!.should.equal('Basket'));
        it('should draw one header landmark', () => screen.getAllByRole('banner').length.should.equal(1));
        it('should leave the middle empty when the application has no navigation', () => document.querySelector('.shell-bar-center')!.childNodes.length.should.equal(0));
    });

    describe('and the center slot is filled', () => {
        beforeEach(() => {
            render(<Bar element={bar} slots={{ center: [<span key='c'>Search</span>] }} />);
        });

        it('should draw the center slot', () => document.querySelector('.shell-bar-center')!.textContent!.should.equal('Search'));
    });
});
