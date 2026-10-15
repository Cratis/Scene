// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { createDryRunInvoker } from '../slices/createDryRunInvoker';
import { createAnnouncingInvoker } from '../slices/createAnnouncingInvoker';
import { OrdersApplication } from './given';

const button = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}`) });

describe('when a toolbar button shows its emphasis', () => {
    afterEach(cleanup);

    describe('and the buttons are rendered', () => {
        beforeEach(() => { render(<OrdersApplication />); });

        it('should carry the authored emphasis as a data attribute and a class', () =>
            [button('New order').getAttribute('data-scene-emphasis'), button('New order').className, button('Ship').getAttribute('data-scene-emphasis')].should.deep.equal(['primary', 'scene-toolbar-button scene-toolbar-button-primary', 'quiet']));
        it('should default to secondary', () => button('View').getAttribute('data-scene-emphasis')!.should.equal('secondary'));
        it('should say a slice button opens a dialog', () => [button('New order').getAttribute('aria-haspopup'), button('View').getAttribute('aria-haspopup')].should.deep.equal(['dialog', null]));
        it('should not show a warning in a running application', () => document.querySelectorAll('[data-scene-badge="warning"]').length.should.equal(0));
    });

    describe('and a design or preview host asks for warnings', () => {
        beforeEach(() => { render(<OrdersApplication invoker={createAnnouncingInvoker()} warnEmptySlices />); });

        it('should flag only the button that has no slice', () =>
            Array.from(document.querySelectorAll('[data-scene-warning="emptySlice"]')).map(node => node.textContent).should.deep.equal(['Cancel order!']));
        it('should give the badge an accessible name', () => screen.getByRole('img', { name: 'No slice is linked to this button' }).textContent!.should.equal('!'));
    });

    describe('and the invoker is a dry run', () => {
        it('should warn about an empty button without being asked', () => {
            render(<OrdersApplication invoker={createDryRunInvoker()} />);
            document.querySelectorAll('[data-scene-warning="emptySlice"]').length.should.equal(1);
        });
    });

    describe('and the host has no navigation model', () => {
        let commands: { command: string }[];
        const onCommand = (event: Event) => commands.push((event as CustomEvent).detail);

        beforeEach(() => {
            commands = [];
            globalThis.addEventListener('cratis.scene.command', onCommand);
            render(<OrdersApplication withModel={false} />);
            fireEvent.click(button('New order'));
        });

        afterEach(() => globalThis.removeEventListener('cratis.scene.command', onCommand));

        it('should announce the slice as before instead of opening a dialog', () => [commands.map(command => command.command), screen.queryByRole('dialog')].should.deep.equal([['sales.orders.PlaceOrder'], null]));
    });
});
