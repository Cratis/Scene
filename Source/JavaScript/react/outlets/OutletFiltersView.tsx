// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveOutlet } from '@cratis/scene.engine';
import { FilterControl, OutletFilter, OutletItemKind } from '@cratis/scene.model';
import { useSceneRouter } from '../routing/SceneRouterContext';
import { FilterChoice, useSceneOutlets } from './SceneOutletsContext';

export interface OutletFiltersViewProps {
    /** The resolved outlet of filters. */
    outlet: EffectiveOutlet;

    /** The id of the element that draws the outlet. */
    elementId?: string;
}

/** The separator a range filter writes between its lower and upper bound, such as `100..500`. */
export const rangeSeparator = '..';

/**
 * Splits the value a range filter wrote into its bounds.
 * @param value The value, such as `100..500`, `100..` or `..500`.
 * @returns The lower and upper bound; empty where there is none.
 */
export function rangeBounds(value: string | undefined): [string, string] {
    if (!value) return ['', ''];
    const at = value.indexOf(rangeSeparator);
    return at < 0 ? [value, ''] : [value.slice(0, at), value.slice(at + rangeSeparator.length)];
}

/**
 * Joins a range filter's bounds into the value it writes.
 * @param lower The lower bound; empty for none.
 * @param upper The upper bound; empty for none.
 * @returns The value, or undefined when neither bound is set.
 */
export function rangeValue(lower: string, upper: string): string | undefined {
    return lower === '' && upper === '' ? undefined : `${lower}${rangeSeparator}${upper}`;
}

interface FilterProps {
    filter: OutletFilter;
    value: string | undefined;
    choices: FilterChoice[];
    write(value: string | undefined): void;
}

function Filter({ filter, value, choices, write }: FilterProps) {
    const control = filter.control ?? FilterControl.Search;
    const common = {
        'data-scene-outlet-item': filter.id,
        'data-scene-filter-control': control,
        'data-scene-query': filter.sets?.query,
        'data-scene-query-parameter': filter.sets?.parameter,
    };

    switch (control) {
        case FilterControl.Choice:
            return <div role='group' aria-label={filter.title} className='scene-outlet-filter scene-outlet-filter-choice' {...common}>
                {choices.map(choice => <button key={choice.value} type='button' aria-pressed={value === choice.value} className='scene-outlet-chip'
                    onClick={() => write(value === choice.value ? undefined : choice.value)}>{choice.label}</button>)}
            </div>;
        case FilterControl.Range: {
            const [lower, upper] = rangeBounds(value);
            return <fieldset className='scene-outlet-filter scene-outlet-filter-range' {...common}>
                <legend>{filter.title}</legend>
                <input type='number' aria-label={`${filter.title} from`} value={lower} onChange={event => write(rangeValue(event.target.value, upper))} />
                <input type='number' aria-label={`${filter.title} to`} value={upper} onChange={event => write(rangeValue(lower, event.target.value))} />
            </fieldset>;
        }
        case FilterControl.Date:
            return <label className='scene-outlet-filter scene-outlet-filter-date' {...common}>
                <span>{filter.title}</span>
                <input type='date' value={value ?? ''} onChange={event => write(event.target.value || undefined)} />
            </label>;
        default:
            return <label className='scene-outlet-filter scene-outlet-filter-search' {...common}>
                <span className='scene-outlet-filter-label'>{filter.title}</span>
                <input type='search' placeholder={filter.title} value={value ?? ''} onChange={event => write(event.target.value || undefined)} />
            </label>;
    }
}

/**
 * Draws an outlet of filters: a control per filter, chosen by its `control` - a search box, choice chips, a range or a
 * date - each writing its value to the query parameter it `sets` through the router. A routed host (Stage) keeps those
 * values in the URL, such as `?q=kettle&status=onSale`; the query the screen shows reads them back with
 * `useSceneQueryParameters`. A filter that sets no parameter writes one named after its id.
 */
export function OutletFiltersView({ outlet, elementId }: OutletFiltersViewProps) {
    const router = useSceneRouter();
    const context = useSceneOutlets();
    const filters = outlet.items.map(entry => entry.item).filter((item): item is OutletFilter => item.kind === OutletItemKind.Filter);

    return <div role='search' aria-label={outlet.name} data-scene-outlet={outlet.name} data-scene-outlet-kind={outlet.kind} data-scene-id={elementId} className='scene-outlet scene-outlet-filters'>
        {filters.map(filter => {
            const parameter = filter.sets?.parameter ?? filter.id;
            return <Filter key={filter.id} filter={filter} value={router.state.query[parameter]} choices={context?.filterChoices?.[filter.id] ?? []}
                write={value => router.setQueryParameter(parameter, value)} />;
        })}
    </div>;
}
