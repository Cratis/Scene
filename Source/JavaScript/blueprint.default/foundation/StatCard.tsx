// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { ComponentState, readComponentState } from './ComponentState';
import { FoundationFrame } from './StateFrame';
import { TrendChipView } from './TrendChip';
import { formatNumber, readLocale, readNumberFormat } from './formatting';
import { readFoundationStrings } from './foundationStrings';
import { readOptionalString, readString } from '../shell/elementProperties';

/**
 * The `statCard` component: one key figure with its label, its trend and what the trend is compared to - the unit of a dashboard's
 * `kpis` slot.
 *
 * The value is a bound number, never embedded in the component (a figure is data, not design); it is formatted for the locale as
 * a number, currency, percent or compact. With no value the card is empty, and it shows all five standard states
 * independently of its neighbours, so a dashboard whose one query failed still shows the other cards.
 */
export function StatCard({ element, interactions }: RegisteredComponentProps) {
    const value = element.properties.value;
    const hasValue = typeof value === 'number';
    const state = readComponentState(element, hasValue);
    const locale = readLocale(element);
    const label = readString(element, 'label');
    const change = element.properties.change;
    const currency = readOptionalString(element, 'currency');

    return (
        <FoundationFrame element={element} interactions={interactions}
            name='stat-card' state={state} skeleton={[40, 70, 30]}>
            {state !== ComponentState.Loading && (
                <>
                    <h3 className='foundation-stat-label'>{label}</h3>
                    <p className='foundation-stat-value'>{hasValue ? formatNumber(value, locale, readNumberFormat(element), currency, typeof element.properties.fractionDigits === 'number' ? element.properties.fractionDigits : undefined) : ''}</p>
                    {typeof change === 'number' && (
                        <TrendChipView change={change} locale={locale} goodDirection={element.properties.goodDirection === 'down' ? 'down' : 'up'}
                            comparison={readOptionalString(element, 'comparison')} strings={readFoundationStrings(element)} />
                    )}
                </>
            )}
        </FoundationFrame>
    );
}
