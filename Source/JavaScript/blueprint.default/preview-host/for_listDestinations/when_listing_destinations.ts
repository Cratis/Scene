// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DestinationKind } from '@cratis/scene.model';
import { galleryApplication } from '../galleryApplication';
import { DestinationGroup, listDestinations } from '../listDestinations';
import { ordersApplication } from '../for_ScenePreviewHost/given';

const fixture = join(import.meta.dirname, 'gallery-destinations.fixture.json');

describe('when listing destinations', () => {
    describe('and the application is the gallery', () => {
        const listing = listDestinations(galleryApplication());

        it('should group them as pages, states and dialogs', () => listing.map(entry => entry.group).should.deep.equal([DestinationGroup.Pages, DestinationGroup.States, DestinationGroup.Dialogs]));
        it('should list what the shared fixture lists', () => {
            const summary = listing.map(entry => ({ group: entry.group, destinations: entry.destinations.map(destination => ({ id: destination.id, label: destination.label, destination: destination.destination })) }));
            if (process.env.UPDATE_DESTINATION_FIXTURE) writeFileSync(fixture, `${JSON.stringify(summary, null, 4)}\n`);
            summary.should.deep.equal(JSON.parse(readFileSync(fixture, 'utf-8')));
        });
        it('should give every page a screen the document renders', () => {
            const screens = new Set(galleryApplication().screens.map(screen => screen.name));
            listing.flatMap(entry => entry.destinations).filter(destination => destination.destination.kind !== DestinationKind.Dialog).every(destination => screens.has(destination.destination.screen!)).should.equal(true);
        });
        it('should name the template of a dialog', () => listing.find(entry => entry.group === DestinationGroup.Dialogs)!.destinations.every(destination => destination.destination.dialog !== undefined).should.equal(true));
        it('should have every destination of the gallery navigation among its pages', () => {
            const pages = listing.flatMap(entry => entry.destinations).map(destination => destination.destination.screen);
            ['Dashboard', 'CrudList', 'MasterDetail', 'DetailView', 'FormPage', 'Invoice', 'Empty', 'UserManagement', 'ProfileSettings', 'Documentation', 'Help'].every(name => pages.includes(name)).should.equal(true);
        });
    });

    describe('and the application has authored screens and no templates', () => {
        const listing = listDestinations(ordersApplication());

        it('should list each as a page named by the screen', () => listing.should.deep.equal([{
            group: DestinationGroup.Pages,
            destinations: ordersApplication().screens.map(screen => ({ id: `page:${screen.name}`, label: screen.name, group: DestinationGroup.Pages, category: undefined, destination: { kind: DestinationKind.Outlet, screen: screen.name }, layout: 'AppShell' })),
        }]));
    });

    describe('and the application has nothing', () => {
        it('should list nothing', () => listDestinations({ layouts: [], screenTemplates: [], screens: [] }).should.deep.equal([]));
    });
});
