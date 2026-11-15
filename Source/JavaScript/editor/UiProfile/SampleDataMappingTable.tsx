// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describeMappingRows, shapesOfActivePack } from '../SampleData';
import { UiProfileStrings } from './UiProfileStrings';
import { SampleDataManagerModel } from './SampleDataManagerModel';
import { sampleDataOf } from './sampleDataOf';
import './SampleDataPane.css';

export interface SampleDataMappingTableProps {
    /** The workspace state and actions. */
    model: SampleDataManagerModel;

    /** The labels to render with. */
    strings: Pick<UiProfileStrings, 'sampleData'>;
}

/**
 * The shape to read model mapping table (spec p23-2): a row for each shape the active pack carries data for, saying which read
 * model of the application it stands in for. A shape that already has a read model's name needs nothing; any other shape is left
 * for the user to map, and its rows are not used until they do. The choices of read model are the application's own.
 */
export function SampleDataMappingTable({ model, strings }: SampleDataMappingTableProps) {
    const labels = strings.sampleData;
    const selection = sampleDataOf(model.draft);
    const packs = [...model.ownSampleDataPacks];
    const shapes = shapesOfActivePack(packs, selection.activePack);
    const isBlueprintPack = selection.activePack !== '' && !packs.some(pack => pack.id === selection.activePack);
    const rows = describeMappingRows(shapes, model.readModels, selection.mappings);

    return (
        <section className='studio-sample-data__section' aria-labelledby='studio-sample-data-mappings'>
            <h3 id='studio-sample-data-mappings'>{labels.mappings}</h3>
            <p className='studio-sample-data__hint'>{labels.mappingsIntro}</p>
            {selection.activePack === '' && <p className='studio-sample-data__hint'>{labels.mappingsEmpty}</p>}
            {isBlueprintPack && <p className='studio-sample-data__hint'>{labels.mappingsBlueprint}</p>}
            {rows.length > 0 && (
                <table className='studio-sample-data__table'>
                    <thead><tr><th scope='col'>{labels.shapeColumn}</th><th scope='col'>{labels.readModelColumn}</th></tr></thead>
                    <tbody>
                        {rows.map(row => (
                            <tr key={row.shape}>
                                <th scope='row'>{row.shape}</th>
                                <td>
                                    <select aria-label={`${labels.readModelColumn}: ${row.shape}`} value={row.readModel} onChange={event => model.mapSampleDataShape(row.shape, event.target.value)}>
                                        <option value=''>{row.matchesByName ? labels.matchesByName : labels.notMapped}</option>
                                        {model.readModels.map(readModel => <option key={readModel} value={readModel}>{readModel}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
