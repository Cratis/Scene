// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { classifySampleStatus, describeSampleDataCatalog, type SampleDataCatalogEntry } from '@cratis/scene.engine';
import type { SampleDataPack } from '@cratis/scene.model';
import type { ScenePackageBundle } from '@cratis/scene.react';
import type { SampleDataManagerModel } from '../../UiProfile/SampleDataManagerModel';
import type { UiProfileStrings } from '../../UiProfile/UiProfileStrings';
import { SampleDataPackManager } from '../../UiProfile/SampleDataPackManager';
import { sampleDataOf } from '../../UiProfile/sampleDataOf';
import { afterRemovingPack, bindProfileReadModel, chooseActivePack, mapProfileShape } from '../SampleData/chooseProfileSampleData';
import type { ProfileSampleDataInput } from '../SampleData/ProfileSampleData';
import type { DesignedProfile } from '../Session/DesignedProfile';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { Field } from './Field';

export interface SampleDataSectionCardsProps {
    settings: DesignedProfile;
    bundles: ScenePackageBundle[];
    sampleData?: ProfileSampleDataInput;
    pickerStrings: Pick<UiProfileStrings, 'sampleData'>;
    strings: UiProfileDesignerStrings;
    onEdit: (next: DesignedProfile, label: string) => void;
}

const empty: Promise<{ succeeded: boolean; messages: string[] }> = Promise.resolve({ succeeded: false, messages: [] });

/** The Sample data section: the packs as cards with what each holds, the status pills Scene classifies, and the manager for the application's own packs. */
export const SampleDataSectionCards = ({ settings, bundles, sampleData, pickerStrings, strings, onEdit }: SampleDataSectionCardsProps) => {
    const text = strings.editor.sampleData;
    const [managing, setManaging] = useState(false);
    const active = sampleDataOf(settings).activePack;
    const catalog = useMemo(() => describeSampleDataCatalog(bundles, (sampleData?.packs ?? []).map(pack => ({ id: pack.id, title: pack.title, locale: pack.locale })), active), [bundles, sampleData, active]);
    const entries: SampleDataCatalogEntry[] = [catalog.generated, ...catalog.blueprints.flatMap(group => group.packs), ...catalog.own];
    const selected = entries.find(entry => entry.selected) ?? catalog.generated;

    const bindablePacks = useMemo(
        () => [...catalog.blueprints.flatMap(group => group.packs), ...catalog.own].map(entry => ({ id: entry.id, label: entry.label })),
        [catalog]);

    const manager = useMemo<SampleDataManagerModel>(() => ({
        draft: settings,
        bindablePacks,
        bindSampleDataPack: (readModel, pack) => onEdit(bindProfileReadModel(settings, readModel, pack), strings.edits.sampleDataBinding),
        ownSampleDataPacks: sampleData?.packs ?? [],
        readModels: sampleData?.readModels ?? [],
        canManageSampleData: sampleData !== undefined,
        mapSampleDataShape: (shape, readModel) => onEdit(mapProfileShape(settings, shape, readModel), strings.edits.sampleDataMapping),
        saveSampleDataPack: async (pack: SampleDataPack, choose) => {
            const result = await (sampleData?.onSavePack(pack) ?? empty);
            if (result.succeeded && choose) onEdit(chooseActivePack(settings, pack.id), strings.edits.sampleData);
            return result.succeeded ? [] : result.messages;
        },
        removeSampleDataPack: async id => {
            const result = await (sampleData?.onRemovePack(id) ?? empty);
            if (result.succeeded) onEdit(afterRemovingPack(settings, id), strings.edits.sampleData);
            return result.succeeded ? [] : result.messages;
        },
    }), [settings, sampleData, bindablePacks, onEdit, strings]);

    return (
        <>
            <Field label={text.pack}>
                <div className='studio-inspector-cards' role='radiogroup' aria-label={text.pack}>
                    {entries.map(entry => (
                        <button key={entry.id || 'generated'} type='button' role='radio' aria-checked={entry.selected} data-selected={entry.selected} onClick={() => onEdit(chooseActivePack(settings, entry.id), strings.edits.sampleData)}>
                            <span className='studio-inspector-card__title'>{entry.isGenerated ? text.generic : entry.label}</span>
                            {entry.description !== undefined && <span className='studio-inspector-card__meta'>{entry.description}</span>}
                            {entry.columns !== undefined && <span className='studio-inspector-card__note'>{entry.columns.join(' · ')}</span>}
                        </button>
                    ))}
                </div>
            </Field>
            {selected.statusColumn !== undefined && selected.statuses !== undefined && (
                <Field label={text.status}>
                    <ul className='studio-inspector-pills' aria-label={text.status}>
                        {([['good', text.good], ['pending', text.pending], ['bad', text.bad], ['neutral', text.neutral]] as const).flatMap(([tone, label]) =>
                            (selected.statuses?.[tone] ?? []).map(value => <li key={`${tone}|${value}`} data-tone={classifySampleStatus(selected.statuses, value)} title={label}>{value}</li>))}
                    </ul>
                </Field>
            )}
            <p className='studio-inspector-field__hint'>{text.production}</p>
            {sampleData !== undefined && (
                <button type='button' className='studio-inspector-link' aria-expanded={managing} onClick={() => setManaging(value => !value)}>
                    {managing ? strings.sampleDataSection.closeManage : strings.sampleDataSection.manage}
                </button>
            )}
            {managing && <SampleDataPackManager model={manager} strings={pickerStrings} />}
        </>
    );
};
