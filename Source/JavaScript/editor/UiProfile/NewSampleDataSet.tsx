// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from '@cratis/components/Common';
import { SampleDataImportFormat, importSampleData, sampleDataPackId } from '../SampleData';
import { UiProfileStrings } from './UiProfileStrings';
import { SampleDataManagerModel } from './SampleDataManagerModel';

export interface NewSampleDataSetProps {
    /** The workspace state and actions. */
    model: SampleDataManagerModel;

    /** The labels to render with. */
    strings: Pick<UiProfileStrings, 'sampleData'>;
}

const formatOf = (fileName: string): SampleDataImportFormat => fileName.toLowerCase().endsWith('.csv') ? SampleDataImportFormat.Csv : SampleDataImportFormat.Json;

/**
 * Makes an own data set: a title, a locale, the shape its rows are for, and the rows themselves, pasted or loaded from a JSON or
 * CSV file. What Scene's `validateSampleDataPack` finds wrong is shown and nothing is saved until it is put right. The new pack
 * is chosen as the application's active pack once it is saved.
 */
export function NewSampleDataSet({ model, strings }: NewSampleDataSetProps) {
    const labels = strings.sampleData;
    const [title, setTitle] = useState('');
    const [locale, setLocale] = useState('en-GB');
    const [shape, setShape] = useState('');
    const [format, setFormat] = useState(SampleDataImportFormat.Json);
    const [text, setText] = useState('');
    const [problems, setProblems] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const loadFile = async (file: File | undefined) => {
        if (!file) return;
        setFormat(formatOf(file.name));
        setText(await file.text());
        if (title.trim() === '') setTitle(file.name.replace(/\.[^.]+$/, ''));
    };

    const save = async () => {
        const id = sampleDataPackId(title, model.ownSampleDataPacks.map(pack => pack.id));
        const imported = importSampleData({ id, title, locale, shape: shape.trim(), text, format });
        const found = [...imported.problems, ...(title.trim() === '' ? [labels.title] : [])];
        if (!imported.pack || found.length > 0) {
            setProblems(found);
            return;
        }

        setIsSaving(true);
        const refused = await model.saveSampleDataPack(imported.pack, true);
        setIsSaving(false);
        setProblems(refused.length > 0 ? [labels.saveFailed, ...refused] : []);
        if (refused.length === 0) {
            setTitle('');
            setShape('');
            setText('');
        }
    };

    return (
        <section className='studio-sample-data__section' aria-labelledby='studio-sample-data-new'>
            <h3 id='studio-sample-data-new'>{labels.newDataSet}</h3>
            <div className='studio-sample-data__form'>
                <label>{labels.title}<input type='text' value={title} onChange={event => setTitle(event.target.value)} /></label>
                <label>{labels.locale}<input type='text' value={locale} onChange={event => setLocale(event.target.value)} /></label>
                <label>{labels.shape}
                    <input type='text' list='studio-sample-data-shapes' value={shape} onChange={event => setShape(event.target.value)} />
                    <datalist id='studio-sample-data-shapes'>{model.readModels.map(readModel => <option key={readModel} value={readModel} />)}</datalist>
                    <span className='studio-sample-data__hint'>{labels.shapeHint}</span>
                </label>
                <label>{labels.format}
                    <select value={format} onChange={event => setFormat(event.target.value as SampleDataImportFormat)}>
                        <option value={SampleDataImportFormat.Json}>{labels.json}</option>
                        <option value={SampleDataImportFormat.Csv}>{labels.csv}</option>
                    </select>
                </label>
                <label>{labels.paste}<textarea rows={8} spellCheck={false} value={text} onChange={event => setText(event.target.value)} /></label>
                <label>{labels.loadFile}<input type='file' accept='.json,.csv,application/json,text/csv' onChange={event => void loadFile(event.target.files?.[0])} /></label>
            </div>
            {problems.length > 0 && (
                <div role='alert' className='studio-sample-data__problems'>
                    <strong>{labels.problems}</strong>
                    <ul>{problems.map(problem => <li key={problem}>{problem}</li>)}</ul>
                </div>
            )}
            <div className='studio-sample-data__actions'>
                <Button label={labels.save} disabled={isSaving || text.trim() === ''} onClick={() => void save()} />
            </div>
        </section>
    );
}
