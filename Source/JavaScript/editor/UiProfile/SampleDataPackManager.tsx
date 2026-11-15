// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from '@cratis/components/Common';
import { NewSampleDataSet } from './NewSampleDataSet';
import { SampleDataBindingTable } from './SampleDataBindingTable';
import { SampleDataMappingTable } from './SampleDataMappingTable';
import { UiProfileStrings } from './UiProfileStrings';
import { SampleDataManagerModel } from './SampleDataManagerModel';
import { formatMessage } from './formatMessage';
import './SampleDataPane.css';

export interface SampleDataPackManagerProps {
    model: SampleDataManagerModel;

    strings: Pick<UiProfileStrings, 'sampleData'>;
}

// The packs the application has made and the forms to make, import and map them: everything about sample data except choosing which one is active.
export function SampleDataPackManager({ model, strings }: SampleDataPackManagerProps) {
    const labels = strings.sampleData;
    const [failure, setFailure] = useState<string[]>([]);

    const remove = async (id: string) => setFailure(await model.removeSampleDataPack(id));

    return (
        <div className='studio-sample-data'>
            <section className='studio-sample-data__section' aria-labelledby='studio-sample-data-own'>
                <h3 id='studio-sample-data-own'>{labels.myDataSets}</h3>
                {model.ownSampleDataPacks.length === 0 && <p className='studio-sample-data__hint'>{labels.noDataSets}</p>}
                <ul className='studio-sample-data__list'>
                    {model.ownSampleDataPacks.map(pack => (
                        <li key={pack.id}>
                            <span>{pack.title}</span>
                            <span className='studio-sample-data__hint'>{pack.locale} · {pack.sets.map(set => `${set.shape} (${set.rows.length})`).join(', ')}</span>
                            <Button label={labels.remove} size='small' variant='ghost' aria-label={formatMessage(labels.removeConfirm, { subject: pack.title })} onClick={() => void remove(pack.id)} />
                        </li>
                    ))}
                </ul>
                {failure.length > 0 && <div role='alert' className='studio-sample-data__problems'><ul>{failure.map(message => <li key={message}>{message}</li>)}</ul></div>}
            </section>
            {model.canManageSampleData && <NewSampleDataSet model={model} strings={strings} />}
            <SampleDataMappingTable model={model} strings={strings} />
            <SampleDataBindingTable model={model} strings={strings} />
        </div>
    );
}
