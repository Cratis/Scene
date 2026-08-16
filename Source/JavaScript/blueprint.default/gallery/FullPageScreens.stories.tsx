// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { GalleryScreenPreview } from './GalleryScreenPreview';

/**
 * Every screen template that renders in the chrome-less shell.
 *
 * These have no navigation, no breadcrumb and no sidebar - which is exactly why they use a different
 * layout rather than a stripped-down application shell. The configurator is still there, because a sign-in
 * page has to honor the chosen theme.
 */
const meta = {
    title: 'Blueprint/Full-page screens',
    component: GalleryScreenPreview,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'The ten chrome-less screens: everything around signing in, the three status pages, and the landing page.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof GalleryScreenPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Email and password beside the branding panel. */
export const Login: Story = { args: { screenName: 'Login' } };

/** Account creation, with a strength meter and the terms checkbox. */
export const Register: Story = { args: { screenName: 'Register' } };

/** One field and one button. */
export const ForgotPassword: Story = { args: { screenName: 'ForgotPassword' } };

/** Where a reset link lands. */
export const NewPassword: Story = { args: { screenName: 'NewPassword' } };

/** The code step, with its progress indicator. */
export const Verification: Story = { args: { screenName: 'Verification' } };

/** One person, one password, nothing lost. */
export const LockScreen: Story = { args: { screenName: 'LockScreen' } };

/** A server-side failure, said plainly. */
export const Error: Story = { args: { screenName: 'Error' } };

/** Signed in, and still not allowed. */
export const AccessDenied: Story = { args: { screenName: 'AccessDenied' } };

/** A wrong address, with a search box rather than a dead end. */
export const NotFound: Story = { args: { screenName: 'NotFound' } };

/** The marketing front door, with navigation of its own. */
export const Landing: Story = { args: { screenName: 'Landing' } };
