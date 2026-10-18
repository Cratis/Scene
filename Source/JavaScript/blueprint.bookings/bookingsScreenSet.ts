// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`bookings.list.record` would be the `record` feature of `list`). */
export interface BookingsScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const bookingsScreenDefinitions: BookingsScreenDefinition[] = [
    { name: 'bookings.calendar', title: 'Calendar', template: 'BookingsCalendar', order: 0, description: 'Every booking on a calendar: who has what, and when.' },
    { name: 'bookings.list', title: 'Bookings', template: 'BookingsList', order: 1, description: 'Every booking with its resource, time and status.' },
    { name: 'bookings.record', title: 'Booking', template: 'BookingPage', parent: 'bookings.list', description: 'One booking: key facts, its attendees, its extras and its activity.' },
    { name: 'bookings.resources', title: 'Resources', template: 'ResourcesList', order: 2, description: 'The rooms, equipment and vehicles that can be booked.' },
    { name: 'bookings.new', title: 'New booking', template: 'NewBookingWizard', order: 3, description: 'Book a room, equipment or a vehicle in four short steps.' },
];
