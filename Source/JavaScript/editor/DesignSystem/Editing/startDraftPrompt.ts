// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemConfirmation } from '../DesignSystemHost';

/**
 * Says what starting a draft means, so that it is a decision and not a click that happened to land on the button.
 *
 * @param hasActive Whether the design system already has an active version the draft starts from.
 * @param strings The words to use.
 * @returns What to ask.
 */
export const startDraftPrompt = (hasActive: boolean, strings: DesignSystemEditorStrings['prompts']): DesignSystemConfirmation =>
    hasActive ? strings.startDraft : strings.startFromStarter;
