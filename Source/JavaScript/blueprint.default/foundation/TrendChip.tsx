// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { FoundationIcon } from './FoundationIcon';
import { formatNumber, NumberFormat, readLocale } from './formatting';
import { formatText, readFoundationStrings } from './foundationStrings';
import { readOptionalString } from '../shell/elementProperties';

/** The direction a measure moved. */
export type TrendDirection = 'up' | 'down' | 'flat';

/** Whether a movement is good, bad or neither, which is independent of whether the number rose: falling response time is good. */
export type TrendOutcome = 'good' | 'bad' | 'neutral';

/** The direction a change moved in. */
export function trendDirection(change: number): TrendDirection {
    return change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
}

/** Whether a movement is good for a measure, given which direction is the good one. */
export function trendOutcome(direction: TrendDirection, goodDirection: 'up' | 'down'): TrendOutcome {
    return direction === 'flat' ? 'neutral' : direction === goodDirection ? 'good' : 'bad';
}

/** The tone each outcome is drawn in. */
const tones: Record<TrendOutcome, string> = { good: 'success', bad: 'danger', neutral: 'neutral' };

/** The props of a trend chip drawn directly, as the stat card does. */
export interface TrendChipViewProps {
    change: number;
    locale: string;
    goodDirection?: 'up' | 'down';
    comparison?: string;
    format?: NumberFormat;
    strings: ReturnType<typeof readFoundationStrings>;
}

/**
 * A change, drawn as an arrow, the change and what it is compared to.
 *
 * Color says whether the movement is good, but never alone: the arrow gives direction and a visually hidden sentence
 * says all of it ("up 12.5% compared to last month"), so the chip reads the same without color.
 */
export function TrendChipView({ change, locale, goodDirection = 'up', comparison, format = NumberFormat.Percent, strings }: TrendChipViewProps) {
    const direction = trendDirection(change);
    const outcome = trendOutcome(direction, goodDirection);
    const magnitude = formatNumber(Math.abs(change), locale, format);
    const spoken = direction === 'flat' ? strings.trendFlat : formatText(direction === 'up' ? strings.trendUp : strings.trendDown, { value: magnitude });

    return (
        <span className='foundation-chip foundation-trend' data-tone={tones[outcome]} data-direction={direction}>
            <FoundationIcon name={direction === 'up' ? 'arrow-up' : direction === 'down' ? 'arrow-down' : 'minus'} />
            <span aria-hidden='true'>{direction === 'flat' ? magnitude : magnitude}</span>
            <span className='foundation-visually-hidden'>{spoken}{comparison ? ` ${formatText(strings.trendComparison, { period: comparison })}` : ''}</span>
            {comparison && <span className='foundation-trend-comparison' aria-hidden='true'>{formatText(strings.trendComparison, { period: comparison })}</span>}
        </span>
    );
}

/**
 * The `trendChip` component: a change with its direction, whether that is good, and what it is compared to.
 *
 * `change` is the movement as a number (a percentage by default), `goodDirection` says which way is good, and `comparison` names
 * the period. Without a number the chip is empty, and then it draws nothing rather than an invented zero.
 */
export function TrendChip({ element }: RegisteredComponentProps) {
    const change = element.properties.change;
    if (typeof change !== 'number') return undefined;

    return (
        <span className='foundation foundation-trend-chip' data-scene-id={element.id}>
            <TrendChipView change={change} locale={readLocale(element)} goodDirection={element.properties.goodDirection === 'down' ? 'down' : 'up'}
                comparison={readOptionalString(element, 'comparison')} strings={readFoundationStrings(element)}
                {...(typeof element.properties.format === 'string' && (Object.values(NumberFormat) as string[]).includes(element.properties.format) ? { format: element.properties.format as NumberFormat } : {})} />
        </span>
    );
}
