// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { readFoundationStrings } from './foundationStrings';
import { FoundationIcon, FoundationIconName } from './FoundationIcon';
import { readOptionalString, readString } from '../shell/elementProperties';

/** The semantic tone of a status. */
export enum StatusTone {
    Success = 'success',
    Warning = 'warning',
    Danger = 'danger',
    Info = 'info',
    Neutral = 'neutral',
}

/** The icon each tone gets, so a status is told by shape as well as color (WCAG 1.4.1). */
export const statusToneIcons: Record<StatusTone, FoundationIconName> = {
    [StatusTone.Success]: 'check',
    [StatusTone.Warning]: 'alert',
    [StatusTone.Danger]: 'close',
    [StatusTone.Info]: 'info',
    [StatusTone.Neutral]: 'circle',
};

/** Reads a tone, defaulting to Neutral. */
export function readStatusTone(value: unknown): StatusTone {
    return (Object.values(StatusTone) as string[]).includes(value as string) ? (value as StatusTone) : StatusTone.Neutral;
}

/**
 * The `statusChip` component: a status as a semantic color, an icon and its text.
 *
 * The text is always shown - the status of a record is never only a colored dot - and the tone picks the icon and the color from
 * the theme's status tokens. A status the application names ("Awaiting approval") is its own `status` text; `tone` maps it onto
 * one of the five tones.
 */
export function StatusChip({ element }: RegisteredComponentProps) {
    const tone = readStatusTone(element.properties.tone);
    const strings = readFoundationStrings(element);
    const fallback = { success: strings.statusSuccess, warning: strings.statusWarning, danger: strings.statusDanger, info: strings.statusInfo, neutral: strings.statusNeutral }[tone];
    const text = readString(element, 'status', readOptionalString(element, 'label') ?? fallback);

    return (
        <span className='foundation foundation-chip foundation-status-chip' data-scene-id={element.id} data-tone={tone}>
            <FoundationIcon name={statusToneIcons[tone]} />
            <span>{text}</span>
        </span>
    );
}
