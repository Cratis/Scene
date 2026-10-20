// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Screen } from '@cratis/scene.model';
import { screensForSlice, screensOwnedBy } from '../sliceScreens';

const screen = (name: string, owner?: string): Screen => ({ name, layout: 'AppShell', slotContent: {}, forms: [], contributions: [], ...(owner === undefined ? {} : { owner }) });

describe('when choosing the screens of a slice', () => {
    const screens = [
        screen('Application'),
        screen('Clerk', 'Sales.Orders.PlaceOrder'),
        screen('Lister', 'Sales.Orders.OrderList'),
        screen('Registrar', 'Sales.Customers.Register'),
        screen('Clerk2', 'Sales.Orders.PlaceOrder'),
        screen('Footer'),
    ];

    describe('and the slice owns screens', () => {
        const chosen = screensForSlice(screens, 'Sales.Orders.PlaceOrder').map(candidate => candidate.name);

        it('should keep the screens the slice owns first, then the screens nobody owns', () => chosen.should.deep.equal(['Clerk', 'Clerk2', 'Application', 'Footer']));
        it('should list only the screens it owns when asked', () => screensOwnedBy(screens, 'Sales.Orders.PlaceOrder').map(candidate => candidate.name).should.deep.equal(['Clerk', 'Clerk2']));
    });

    describe('and the slice owns none', () => {
        it('should keep the screens nobody owns and no other slice\'s', () => screensForSlice(screens, 'Sales.Orders.Reminder').map(candidate => candidate.name).should.deep.equal(['Application', 'Footer']));
    });

    describe('and a slice has a name that only resembles another', () => {
        it('should not take the screens of the one it resembles', () => screensForSlice(screens, 'Orders.PlaceOrder').map(candidate => candidate.name).should.deep.equal(['Application', 'Footer']));
    });
});
