// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { wizardScreenTemplate } from '@cratis/scene.blueprint.default';
import { BookingsQuery, currencyOfData, fromQuery, localeOfData } from '../bookingsQueries';
import { bookingsMetadata, component } from '../bookingsParts';

/** The new-booking wizard: what you need, when you need it, a few details, then a review. The step the person has reached survives a refresh and an invalid step blocks Next and says why. */
export const newBookingWizardTemplate: ScreenTemplate = {
    name: 'NewBookingWizard',
    fitsSlot: 'content',
    slots: wizardScreenTemplate.slots,
    arrangement: wizardScreenTemplate.arrangement,
    content: {
        header: [component('NewBookingWizard-header', 'pageHeader', { title: 'New booking', subtitle: 'Four short steps' })],
        progress: [component('NewBookingWizard-progress', 'wizardProgress', { steps: fromQuery(BookingsQuery.BookingWizardSteps), urlKey: 'step' }, {
            resource: [component('NewBookingWizard-resource', 'formScreenBody', { mode: 'create', sections: fromQuery(BookingsQuery.BookingResourceSections), errors: fromQuery(BookingsQuery.FormErrors, '0'), ...localeOfData })],
            when: [component('NewBookingWizard-when', 'formScreenBody', { mode: 'create', sections: fromQuery(BookingsQuery.BookingWhenSections), errors: fromQuery(BookingsQuery.FormErrors, '0'), ...localeOfData })],
            details: [component('NewBookingWizard-details', 'formScreenBody', { mode: 'create', sections: fromQuery(BookingsQuery.BookingDetailSections), errors: fromQuery(BookingsQuery.FormErrors, '0'), ...localeOfData })],
            review: [component('NewBookingWizard-review', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(BookingsQuery.BookingReviewSections), values: fromQuery(BookingsQuery.BookingReviewValues, '0'), ...currencyOfData })],
        })],
        step: [],
        actions: [],
    },
    displayName: 'New booking wizard',
    description: 'Resource, time, details, then review and book; the step survives a refresh and an invalid step blocks Next and says why.',
    metadata: bookingsMetadata('NewBookingWizard', 'Wizard', [TemplateScope.Feature, TemplateScope.Subfeature]),
};
