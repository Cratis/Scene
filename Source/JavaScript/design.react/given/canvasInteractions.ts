// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, screen, waitFor } from '@testing-library/react';

/** Asks the chat bar and waits until the turn is over: the answer is on screen and the bar can be used again. */
export async function askTheChat(prompt: string, answer: string | RegExp): Promise<void> {
    fireEvent.change(screen.getByLabelText('Describe what to design or change'), { target: { value: prompt } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText(answer);
    await waitFor(() => screen.getByLabelText('Describe what to design or change'));
    await waitFor(() => screen.getByRole('button', { name: 'Send' }));
}

/** Opens a tab of the canvas' side panel. */
export const openTab = (name: string): void => { fireEvent.click(screen.getByRole('tab', { name })); };

/** The names of the artboards on the canvas, in the order they are laid out. */
export const artboardNames = (): (string | null)[] => [...document.querySelectorAll('[data-artboard]')].map(element => element.getAttribute('data-artboard'));
