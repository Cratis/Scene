// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemPreviewStrings } from '../DesignSystemEditorStrings';
import { fill } from '../fill';
import type { DesignSystemPreview, PreviewImage, ScreenPreview } from './DesignSystemPreview';

/** The two modes a screen is drawn in. */
export type PreviewMode = 'light' | 'dark';

/** The pictures of one screen in one mode - the active version beside the draft. */
export interface PreviewPair {
    /** The picture drawn with the active version, when there is one. */
    active?: PreviewImage;

    /** The picture drawn with the draft. */
    draft?: PreviewImage;
}

/**
 * Says how the draft looks on the screens.
 *
 * @param preview The preview.
 * @param strings The words to use.
 * @returns A sentence - how many screens look different, how many break.
 */
export const previewHeadline = (preview: DesignSystemPreview, strings: DesignSystemPreviewStrings): string => {
    const screens = preview.screens ?? [];
    if (screens.length === 0) return preview.problem || strings.noScreens;
    const total = screens.length;
    const different = preview.different === 0
        ? strings.differentNone
        : fill(preview.different === 1 ? strings.differentOne : strings.differentMany, { count: preview.different, total });
    const broken = preview.broken === 0
        ? strings.breaksNone
        : fill(preview.broken === 1 ? strings.breaksOne : strings.breaksMany, { count: preview.broken });
    return `${different}, ${broken}.`;
};

/**
 * Gets the pictures of a screen in one mode.
 *
 * @param screen The screen.
 * @param mode The mode.
 * @returns The active picture and the draft's.
 */
export const pairFor = (screen: ScreenPreview, mode: PreviewMode): PreviewPair => {
    const images = (screen.images ?? []).filter(image => image.mode === mode);
    return { active: images.find(image => image.version === 'active'), draft: images.find(image => image.version === 'draft') };
};

/**
 * Says what is wrong with a screen in the draft, or that it looks the same.
 *
 * @param screen The screen.
 * @returns A short status.
 */
export const screenStatus = (screen: ScreenPreview): 'breaks' | 'differs' | 'same' => screen.broken ? 'breaks' : screen.different ? 'differs' : 'same';
