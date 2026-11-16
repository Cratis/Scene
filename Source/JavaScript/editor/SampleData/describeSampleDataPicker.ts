// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataCatalog, SampleDataCatalogEntry } from '@cratis/scene.engine';
import { CascadeEntry, CascadeEntryKind } from '../CascadeMenu';
import { SampleDataPickerHandlers } from './SampleDataPickerHandlers';
import { SampleDataPickerLabels } from './SampleDataPickerLabels';

const matches = (entry: SampleDataCatalogEntry, blueprint: string | undefined, filter: string): boolean => {
    const needle = filter.trim().toLocaleLowerCase();
    return needle.length === 0 || [entry.name, entry.label, entry.locale, blueprint].some(value => value?.toLocaleLowerCase().includes(needle));
};

/**
 * The rows of the sample data picker, from Scene's description of what can be chosen.
 *
 * It is the template picker's structure again: the generated data and the user's own data sets directly, the blueprints'
 * packs one level deeper (`Blueprints ▸`, then a heading per blueprint, then its packs with their locale on the right), a
 * check on the one in effect, and `+ New data set...` as the footer (spec 11, p23-1).
 *
 * @param catalog Scene's description of the choices - `describeSampleDataCatalog`.
 * @param filter What was typed into the filter, if the host offers one.
 * @param labels The labels to use.
 * @param handlers What choosing does.
 * @returns The rows of the first panel.
 */
export function describeSampleDataPicker(catalog: SampleDataCatalog, filter: string, labels: SampleDataPickerLabels, handlers: SampleDataPickerHandlers): CascadeEntry[] {
    const item = (entry: SampleDataCatalogEntry, id: string, showLocale = false): CascadeEntry => ({
        kind: CascadeEntryKind.Item, id, label: entry.name, checked: entry.selected, ...(showLocale && entry.locale ? { trailing: entry.locale } : {}), onActivate: () => handlers.onChoose(entry.id),
    });
    const heading = (id: string, label: string): CascadeEntry => ({ kind: CascadeEntryKind.Heading, id, label });
    const separator = (id: string): CascadeEntry => ({ kind: CascadeEntryKind.Separator, id, label: '' });

    const generated = matches(catalog.generated, undefined, filter) ? [heading('generated-heading', labels.generated), item(catalog.generated, 'generated')] : [];
    const own = catalog.own.filter(entry => matches(entry, undefined, filter));
    const ownEntries: CascadeEntry[] = own.length === 0 ? [] : [heading('my-data-sets', labels.myDataSets), ...own.map(entry => item(entry, `own:${entry.id}`))];
    const blueprints = catalog.blueprints
        .map(group => ({ group, packs: group.packs.filter(entry => matches(entry, group.blueprint, filter)) }))
        .filter(entry => entry.packs.length > 0);
    const blueprintEntries: CascadeEntry[] = blueprints.length === 0 ? [] : [{
        kind: CascadeEntryKind.Submenu, id: 'blueprints', label: labels.blueprints,
        entries: blueprints.flatMap(({ group, packs }): CascadeEntry[] => [
            heading(`blueprint:${group.blueprint}`, group.blueprint),
            ...packs.map(entry => item(entry, `blueprint:${group.blueprint}:${entry.id}`, true)),
        ]),
    }];
    const footer: CascadeEntry[] = handlers.onNewDataSet ? [separator('footer-separator'), { kind: CascadeEntryKind.Item, id: 'new-data-set', label: `+ ${labels.newDataSet}`, onActivate: handlers.onNewDataSet }] : [];

    return [
        ...generated,
        ...(ownEntries.length > 0 ? [...(generated.length > 0 ? [separator('own-separator')] : []), ...ownEntries] : []),
        ...(blueprintEntries.length > 0 ? [separator('blueprints-separator'), ...blueprintEntries] : []),
        ...footer,
    ];
}

/**
 * What the closed control shows for the pack in effect: `<Blueprint> · <pack>` for a blueprint's, the title for an own pack,
 * the generated name for none, and the identifier marked unavailable for one nothing provides any more.
 *
 * @param catalog Scene's description of the choices.
 * @param activePack The identifier in effect, or empty for generated.
 * @param labels The labels to use.
 * @returns The text to show.
 */
export function describeActiveSampleData(catalog: SampleDataCatalog, activePack: string, labels: Pick<SampleDataPickerLabels, 'unavailable'>): string {
    if (!activePack) return catalog.generated.label;
    const found = catalog.own.find(entry => entry.id === activePack) ?? catalog.blueprints.flatMap(group => group.packs).find(entry => entry.id === activePack);
    return found?.label ?? labels.unavailable.replace('{id}', activePack);
}
