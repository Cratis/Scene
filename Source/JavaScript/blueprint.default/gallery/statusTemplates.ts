// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';
import { ComponentName } from '../ComponentName';
import { SlotName } from '../layouts';
import { TemplateSlotName } from './TemplateSlotName';
import { button, card, externalComponent, panel, text } from './elements';
import { widget } from './widgets';

/**
 * The four screens that are not part of anyone's plan: a server error, a refusal, a wrong address, and the
 * page that has to sell the product before any of the others exist.
 *
 * They use the full-page layout for the same reason the sign-in screens do - none of them has navigation
 * to render - and they matter more than their frequency suggests. An error page is the screen most likely
 * to be someone's first impression of how carefully an application was built.
 */

/** Something broke on our side. */
export const errorTemplate: ScreenTemplate = {
    name: 'Error',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Body]: [
            card('error-card', [
                externalComponent('error-tag', 'tag', { value: '500', severity: 'danger' }),
                text('error-title', 'Something went wrong on our side'),
                text('error-message', 'The team has been told. Try again in a moment - nothing you were working on was lost.'),
                panel('error-actions', [
                    button('error-retry', 'Try again', { severity: 'primary' }),
                    button('error-home', 'Back to the dashboard', { severity: 'secondary', targetScreen: 'Dashboard' }),
                ]),
            ]),
        ],
    },
    displayName: 'Error',
    description: 'A server-side failure, said plainly, with a way onward.',
};

/** Signed in, and still not allowed. */
export const accessDeniedTemplate: ScreenTemplate = {
    name: 'AccessDenied',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Body]: [
            card('denied-card', [
                externalComponent('denied-tag', 'tag', { value: '403', severity: 'warning' }),
                text('denied-title', 'You do not have access to this'),
                text('denied-message', 'Your account is signed in, but it is not allowed here. An administrator can change that.'),
                panel('denied-actions', [
                    button('denied-request', 'Request access', { severity: 'primary' }),
                    button('denied-home', 'Back to the dashboard', { severity: 'secondary', targetScreen: 'Dashboard' }),
                ]),
            ]),
        ],
    },
    displayName: 'Access denied',
    description: 'A refusal that distinguishes "not signed in" from "not allowed".',
};

/** No such address. */
export const notFoundTemplate: ScreenTemplate = {
    name: 'NotFound',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Body]: [
            card('not-found-card', [
                externalComponent('not-found-tag', 'tag', { value: '404', severity: 'info' }),
                text('not-found-title', 'That page is not here'),
                text('not-found-message', 'The link may be old, or the thing it pointed at may have been removed.'),
                externalComponent('not-found-search', 'inputText', { placeholder: 'Search instead' }),
                button('not-found-home', 'Back to the dashboard', { severity: 'secondary', targetScreen: 'Dashboard' }),
            ]),
        ],
    },
    displayName: 'Not found',
    description: 'A wrong address, with a search box rather than a dead end.',
};

/** The page that has to do the selling. */
export const landingTemplate: ScreenTemplate = {
    name: 'Landing',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [
            panel('landing-nav', [
                externalComponent('landing-logo', ComponentName.Logo, { label: 'Contoso', initials: 'C' }),
                button('landing-signin', 'Sign in', { severity: 'secondary', targetScreen: 'Login' }),
                button('landing-start', 'Start free', { severity: 'primary', targetScreen: 'Register' }),
            ]),
        ],
        [TemplateSlotName.Body]: [
            card('landing-hero', [
                text('landing-headline', 'Ship the shell on day one'),
                text('landing-subhead', 'Eight menu modes, twenty screen templates and two themes, in one blueprint an application picks once.'),
                button('landing-cta', 'Start free', { severity: 'primary', targetScreen: 'Register' }),
            ]),
            widget('landing-feature-modes', 'Every mode people expect', [text('landing-modes-text', 'Static, overlay, slim, slim+, compact, horizontal, reveal and drawer.')]),
            widget('landing-feature-themes', 'Themeable to the token', [text('landing-themes-text', 'Ten semantic tokens define the whole shell. Swap them and everything follows.')]),
            widget('landing-feature-templates', 'The pages you were going to build anyway', [
                text('landing-templates-text', 'Dashboard, list, detail, form, invoice, settings, help - and every screen around signing in.'),
            ]),
        ],
        [TemplateSlotName.Actions]: [
            panel('landing-footer', [text('landing-copyright', '© Contoso'), button('landing-contact', 'Talk to us', { severity: 'secondary' })]),
        ],
    },
    displayName: 'Landing',
    description: 'The marketing front door, with its own navigation because it has no application chrome.',
};

/** The four status and marketing templates. */
export const statusTemplates: ScreenTemplate[] = [errorTemplate, accessDeniedTemplate, notFoundTemplate, landingTemplate];
