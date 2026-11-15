// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfileStrings } from './UiProfileStrings';
import { SampleDataManagerModel } from './SampleDataManagerModel';
import { isScreenplayIdentifier } from './isScreenplayIdentifier';
import { sampleDataOf } from './sampleDataOf';
import './SampleDataPane.css';

export interface SampleDataBindingTableProps {
    /** The workspace state and actions. */
    model: SampleDataManagerModel;

    /** The labels to render with. */
    strings: Pick<UiProfileStrings, 'sampleData'>;
}

/**
 * The read model to pack binding table: a row for each read model of the application, saying which pack supplies its rows in place of the
 * active pack. A binding to something that is no longer a read model of the application stays listed, marked, so it can be removed. A read
 * model whose name is not a Screenplay identifier cannot be bound: the name is never altered, because Scene matches a binding by the exact name.
 */
export function SampleDataBindingTable({ model, strings }: SampleDataBindingTableProps) {
    const labels = strings.sampleData;
    const bindings = sampleDataOf(model.draft).bindings;
    const stale = bindings.map(binding => binding.target).filter(target => !model.readModels.includes(target));
    const rows = [...model.readModels, ...stale];

    return (
        <section className='studio-sample-data__section' aria-labelledby='studio-sample-data-bindings'>
            <h3 id='studio-sample-data-bindings'>{labels.bindings}</h3>
            <p className='studio-sample-data__hint'>{labels.bindingsIntro}</p>
            {rows.length > 0 && (
                <table className='studio-sample-data__table'>
                    <thead><tr><th scope='col'>{labels.readModelColumn}</th><th scope='col'>{labels.packColumn}</th></tr></thead>
                    <tbody>
                        {rows.map(readModel => {
                            const bindable = isScreenplayIdentifier(readModel);
                            const bound = bindings.find(binding => binding.target === readModel)?.pack ?? '';
                            const known = bound === '' || model.bindablePacks.some(pack => pack.id === bound);
                            return (
                                <tr key={readModel}>
                                    <th scope='row'>
                                        {readModel}
                                        {stale.includes(readModel) && <span className='studio-sample-data__hint'> · {labels.bindingStale}</span>}
                                    </th>
                                    <td>
                                        <select aria-label={`${labels.packColumn}: ${readModel}`} value={bindable ? bound : ''} disabled={!bindable} onChange={event => model.bindSampleDataPack(readModel, event.target.value)}>
                                            <option value=''>{bindable ? labels.notBound : labels.bindingNotIdentifier}</option>
                                            {model.bindablePacks.map(pack => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
                                            {!known && <option value={bound}>{bound}</option>}
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </section>
    );
}
