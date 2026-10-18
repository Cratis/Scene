// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { bookingsBlueprintName } from './packageName';
import { bookingsScreenDefinitions } from './bookingsScreenSet';
import { bookingsDialogTemplates, bookingsScreenTemplates } from './templates';

const description = 'Bookings for shared rooms, equipment and vehicles: a booking calendar, a booking list, a booking page, the resources and a wizard that books one in four steps.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const bookingsBlueprintManifest: ScenePackage = {
    name: bookingsBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: bookingsScreenTemplates.map(template => template.name),
    dialogTemplates: bookingsDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Bookings',
    description,
    module: '@cratis/scene.blueprint.bookings',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [{ id: 'bookings-en', title: 'Bookings · English', locale: 'en-GB', path: 'sampleData/bookings-en.json', description: 'English booking data: twelve bookings of eight rooms, equipment and vehicles from requested to completed, one booking\'s attendees and extras, and the wizard steps.', columns: ['Booking', 'Resource', 'Booked by', 'Date', 'From'], statusColumn: 'Status', statuses: { good: ['Confirmed', 'Checked in', 'Completed', 'Available'], pending: ['Requested', 'Booked'], bad: ['Cancelled', 'Maintenance'] } }],
    blueprint: {
        domain: 'bookings',
        description,
        thumbnail: 'thumbnails/bookings.svg',
        screenSet: bookingsScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'bookings-en',
    },
};
