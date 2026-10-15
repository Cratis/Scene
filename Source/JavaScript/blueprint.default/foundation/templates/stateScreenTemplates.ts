// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateMetadata } from '@cratis/scene.model';
import { externalComponent, panel } from '../../gallery/elements';
import { actionButton } from './dialogTemplates';
import { column, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

const metadataOf = (name: string, type: 'Auth' | 'State'): TemplateMetadata => ({ ...foundationTemplateProvenance, type, category: `Foundation / ${type}`, thumbnail: thumbnailOf(name) });

/** The way back every state screen offers: home, which is always somewhere the person is allowed to be. */
const backToDashboard = (id: string) => actionButton(id, { label: 'Back to the dashboard', emphasis: 'secondary', targetScreen: 'DashboardScreen' });

/**
 * The sign-in screen: the logo, the sign-in form, a slot for the identity providers the application offers (`providers` - buttons, each starting its
 * provider's flow, which the application fills), an error area that is a live region and says why a sign-in failed, and a link to help. The form is
 * made of the foundation's form components, so it validates and announces like every other form.
 */
export const loginScreenTemplate: ScreenTemplate = {
    name: 'LoginScreen',
    fitsSlot: 'content',
    slots: [{ name: 'logo' }, { name: 'error' }, { name: 'form' }, { name: 'providers' }, { name: 'help' }],
    arrangement: { root: column([slotLeaf('logo'), slotLeaf('error'), slotLeaf('form'), slotLeaf('providers'), slotLeaf('help')], 16) },
    content: {
        logo: [externalComponent('login-logo', 'logo', { label: 'Contoso', initials: 'C' })],
        error: [component('login-error', 'notice', { text: fromQuery('SignInError', '0.message'), tone: 'danger' })],
        form: [component('login-form', 'formScreenBody', {
            mode: 'create', saveAndNew: false, strings: { formSave: 'Sign in', formCancel: 'Clear' },
            sections: fromQuery('SignInSections'), values: fromQuery('SignInValues', '0'), errors: fromQuery('FormErrors', '0'),
        })],
        providers: [panel('login-providers', [actionButton('login-microsoft', { label: 'Continue with Microsoft', emphasis: 'secondary' }), actionButton('login-github', { label: 'Continue with GitHub', emphasis: 'secondary' })])],
        help: [actionButton('login-help', { label: 'Need help signing in?', emphasis: 'quiet', targetScreen: 'ForbiddenScreen' })],
    },
    displayName: 'Sign in',
    description: 'A sign-in form with a slot for identity providers, an error area and a help link.',
    metadata: metadataOf('LoginScreen', 'Auth'),
};

/** The wrong address: what happened in words, a search, and the way home. */
export const notFoundScreenTemplate: ScreenTemplate = {
    name: 'NotFoundScreen',
    fitsSlot: 'content',
    slots: [{ name: 'message' }, { name: 'search' }, { name: 'actions' }],
    arrangement: { root: column([slotLeaf('message'), slotLeaf('search'), slotLeaf('actions')], 16) },
    content: {
        message: [component('not-found-message', 'emptyState', { icon: 'file', headline: 'That page is not here', hint: 'The link may be old, or the thing it pointed at may have been removed.' })],
        search: [component('not-found-search', 'globalSearch', { label: 'Search the application', placeholder: 'Search instead' })],
        actions: [backToDashboard('not-found-home')],
    },
    displayName: 'Not found',
    description: 'A wrong address explained, with a search and a link home.',
    metadata: metadataOf('NotFoundScreen', 'State'),
};

/**
 * The refusal: signed in, and still not allowed. It says so and offers to ask for access, and it shows nothing of what was refused - the template binds
 * no data at all, so there is nothing to leak.
 */
export const forbiddenScreenTemplate: ScreenTemplate = {
    name: 'ForbiddenScreen',
    fitsSlot: 'content',
    slots: [{ name: 'message' }, { name: 'actions' }],
    arrangement: { root: column([slotLeaf('message'), slotLeaf('actions')], 16) },
    content: {
        message: [component('forbidden-message', 'emptyState', {
            icon: 'lock', headline: 'You do not have access to this', hint: 'Your account is signed in, but it is not allowed here. An administrator can change that.', actionLabel: 'Request access',
        })],
        actions: [backToDashboard('forbidden-home')],
    },
    displayName: 'Forbidden',
    description: 'A refusal that offers to request access and shows none of what was refused.',
    metadata: metadataOf('ForbiddenScreen', 'State'),
};

/** The failure on our side: a plain message, a retry, and the support reference id a person can quote. */
export const errorScreenTemplate: ScreenTemplate = {
    name: 'ErrorScreen',
    fitsSlot: 'content',
    slots: [{ name: 'message' }, { name: 'reference' }, { name: 'actions' }],
    arrangement: { root: column([slotLeaf('message'), slotLeaf('reference'), slotLeaf('actions')], 16) },
    content: {
        message: [component('error-message', 'emptyState', {
            icon: 'alert', headline: 'Something went wrong on our side', hint: 'The team has been told. Nothing you were working on was lost.', actionLabel: 'Try again',
        })],
        reference: [panel('error-reference', [
            externalComponent('error-reference-label', 'text', { text: 'Support reference' }),
            externalComponent('error-reference-id', 'text', { text: fromQuery('SupportReference', '0.id') }),
        ])],
        actions: [backToDashboard('error-home')],
    },
    displayName: 'Error',
    description: 'A generic failure with a retry and the support reference id to quote.',
    metadata: metadataOf('ErrorScreen', 'State'),
};

/** The four auth and state screens of Part B 2.11. The legacy `Login`, `NotFound`, `AccessDenied` and `Error` remain as they were. */
export const stateScreenTemplates: ScreenTemplate[] = [loginScreenTemplate, notFoundScreenTemplate, forbiddenScreenTemplate, errorScreenTemplate];

/** The earlier template each spec-named one stands beside: the old name keeps working, and is the alias of the new. */
export const foundationTemplateAliases: Record<string, string> = {
    LoginScreen: 'Login',
    NotFoundScreen: 'NotFound',
    ForbiddenScreen: 'AccessDenied',
    ErrorScreen: 'Error',
    QuickCreateDialog: 'FormDialog',
};
