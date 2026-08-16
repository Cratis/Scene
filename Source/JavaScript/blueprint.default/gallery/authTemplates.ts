// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';
import { ComponentName } from '../ComponentName';
import { SlotName } from '../layouts';
import { TemplateSlotName } from './TemplateSlotName';
import { button, card, externalComponent, text } from './elements';
import { field, formActions } from './widgets';

/**
 * The six screens that stand between someone and the application: sign in, register, forgotten password,
 * new password, verification and the lock screen.
 *
 * All six fit the full-page layout's `content` slot and fill its `aside` with the branding half. That
 * split - a colored panel of brand next to a narrow column of form - is the shape the premium PrimeTek
 * templates use for every one of them, and the reason it works is that it gives the form somewhere to be
 * *small*, which is what a sign-in form should be.
 */

/** The branding half every authentication screen shares. */
function brandingAside(id: string, headline: string, supporting: string) {
    return [
        externalComponent(`${id}-logo`, ComponentName.Logo, { label: 'Contoso', initials: 'C' }),
        text(`${id}-headline`, headline),
        text(`${id}-supporting`, supporting),
    ];
}

/** Sign in. */
export const loginTemplate: ScreenTemplate = {
    name: 'Login',
    fitsSlot: SlotName.Content,
    slots: [{ name: SlotName.Aside }, { name: TemplateSlotName.Body }],
    content: {
        [SlotName.Aside]: brandingAside('login', 'Welcome back', 'Everything your team shipped since you were last here is waiting.'),
        [TemplateSlotName.Body]: [
            card('login-card', [
                text('login-title', 'Sign in'),
                field('login-email', 'Email', 'inputText', { placeholder: 'you@contoso.com' }),
                field('login-password', 'Password', 'password', { feedback: false }),
                field('login-remember', 'Keep me signed in', 'checkbox', {}),
                formActions('login-actions', 'Sign in', 'Use a different account'),
                button('login-forgot', 'I forgot my password', { link: true, targetScreen: 'ForgotPassword' }),
            ]),
        ],
    },
    displayName: 'Sign in',
    description: 'Email and password beside the branding panel.',
};

/** Register. */
export const registerTemplate: ScreenTemplate = {
    name: 'Register',
    fitsSlot: SlotName.Content,
    slots: [{ name: SlotName.Aside }, { name: TemplateSlotName.Body }],
    content: {
        [SlotName.Aside]: brandingAside('register', 'Start in two minutes', 'No card, no call, no sales engineer. Just an account.'),
        [TemplateSlotName.Body]: [
            card('register-card', [
                text('register-title', 'Create your account'),
                field('register-name', 'Full name', 'inputText', {}),
                field('register-email', 'Work email', 'inputText', { placeholder: 'you@contoso.com' }),
                field('register-password', 'Password', 'password', { feedback: true }),
                field('register-terms', 'I accept the terms of service', 'checkbox', {}),
                formActions('register-actions', 'Create account', 'I already have one'),
            ]),
        ],
    },
    displayName: 'Register',
    description: 'Account creation with a password strength meter and the terms checkbox.',
};

/** Forgotten password: ask for the address. */
export const forgotPasswordTemplate: ScreenTemplate = {
    name: 'ForgotPassword',
    fitsSlot: SlotName.Content,
    slots: [{ name: SlotName.Aside }, { name: TemplateSlotName.Body }],
    content: {
        [SlotName.Aside]: brandingAside('forgot', 'It happens', 'Tell us the address you signed up with and we will send a link.'),
        [TemplateSlotName.Body]: [
            card('forgot-card', [
                text('forgot-title', 'Reset your password'),
                field('forgot-email', 'Email', 'inputText', { placeholder: 'you@contoso.com' }),
                formActions('forgot-actions', 'Send the link', 'Back to sign in'),
            ]),
        ],
    },
    displayName: 'Forgotten password',
    description: 'One field and one button - the whole point is that it asks for nothing else.',
};

/** New password: the other end of the link. */
export const newPasswordTemplate: ScreenTemplate = {
    name: 'NewPassword',
    fitsSlot: SlotName.Content,
    slots: [{ name: SlotName.Aside }, { name: TemplateSlotName.Body }],
    content: {
        [SlotName.Aside]: brandingAside('new-password', 'Almost there', 'Choose something you have not used anywhere else.'),
        [TemplateSlotName.Body]: [
            card('new-password-card', [
                text('new-password-title', 'Choose a new password'),
                field('new-password-value', 'New password', 'password', { feedback: true }),
                field('new-password-confirm', 'Confirm it', 'password', { feedback: false }),
                formActions('new-password-actions', 'Set the password', 'Cancel'),
            ]),
        ],
    },
    displayName: 'New password',
    description: 'Where a reset link lands: choose it, confirm it, done.',
};

/** Verification: the code from the email. */
export const verificationTemplate: ScreenTemplate = {
    name: 'Verification',
    fitsSlot: SlotName.Content,
    slots: [{ name: SlotName.Aside }, { name: TemplateSlotName.Body }],
    content: {
        [SlotName.Aside]: brandingAside('verification', 'Check your email', 'We sent a six-digit code. It expires in ten minutes.'),
        [TemplateSlotName.Body]: [
            card('verification-card', [
                text('verification-title', 'Enter the code'),
                externalComponent('verification-steps', 'steps', { model: ['Account', 'Verify', 'Done'], activeIndex: 1 }),
                field('verification-code', 'Six-digit code', 'inputText', { maxLength: 6 }),
                formActions('verification-actions', 'Verify', 'Send it again'),
            ]),
        ],
    },
    displayName: 'Verification',
    description: 'The code step, with the progress indicator that tells you how much is left.',
};

/** Lock screen: the session is still there, the person has to prove they are. */
export const lockScreenTemplate: ScreenTemplate = {
    name: 'LockScreen',
    fitsSlot: SlotName.Content,
    slots: [{ name: SlotName.Aside }, { name: TemplateSlotName.Body }],
    content: {
        [SlotName.Aside]: brandingAside('lock', 'Locked', 'Your work is exactly where you left it.'),
        [TemplateSlotName.Body]: [
            card('lock-card', [
                externalComponent('lock-avatar', 'avatar', { label: 'AN', size: 'xlarge', shape: 'circle' }),
                text('lock-name', 'Amelia Nyquist'),
                field('lock-password', 'Password', 'password', { feedback: false }),
                formActions('lock-actions', 'Unlock', 'Sign in as someone else'),
            ]),
        ],
    },
    displayName: 'Lock screen',
    description: 'One person, one password, and no way to lose what was open.',
};

/** The six authentication templates. */
export const authTemplates: ScreenTemplate[] = [
    loginTemplate,
    registerTemplate,
    forgotPasswordTemplate,
    newPasswordTemplate,
    verificationTemplate,
    lockScreenTemplate,
];
