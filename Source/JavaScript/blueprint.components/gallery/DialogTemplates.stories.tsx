// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { DialogTemplatePreview } from './DialogTemplatePreview';

/**
 * The three dialog templates, booted through the real engine.
 *
 * A dialog occupies no slot, so there is no shell around these and no layout to place them in - the
 * template's own content is the whole tree, resolved by the real `resolveComponentName` and rendered by
 * the real `SceneElementView`.
 */
const meta = {
    title: 'Blueprint/Dialog templates',
    component: DialogTemplatePreview,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Each dialog template declares exactly one slot, because the Arc-aware dialogs own their own frame, title bar and ' +
                    'buttons - a template offering `header` and `actions` slots would be offering regions that render outside the modal. ' +
                    'The confirmation and busy dialogs reach the Arc runtime as soon as they render, so in a design surface they show the ' +
                    "library's own error boundary rather than a modal; the command dialog shows a placeholder until its command is " +
                    'registered. Both are what an application without an Arc client sees, and both are the point.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof DialogTemplatePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A short capture whose confirm button submits the command and only closes when it succeeded. */
export const CommandDialog: Story = { args: { templateName: 'CommandDialog' } };

/** One question with the consequence spelled out, and a confirm label that says what will happen. */
export const ConfirmDialog: Story = { args: { templateName: 'ConfirmDialog' } };

/** The blocking spinner shown while a long-running command is in flight, with its wording chosen up front. */
export const BusyDialog: Story = { args: { templateName: 'BusyDialog' } };
