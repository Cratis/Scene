// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext, useMemo } from 'react';
import type { PropertyEditorProps } from '../../ScreenEditor/PropertyEditors/Registry/PropertyEditorProps';
import { SampleDataPicker } from '../../SampleData/SampleDataPicker';
import { ProfileSampleDataContext } from './ProfileSampleData';

// The `sampleData` property editor of the designer: the cascade menu the toolbar used (Generated, My data sets, Blueprints ▸ with each pack's locale,
// New data set...), chosen from Scene's catalog. The value is the pack's id; empty is the generated data, which is always an explicit entry.
export const ProfileSampleDataEditor = ({ value, onChange, disabled }: PropertyEditorProps<string>) => {
    const choices = useContext(ProfileSampleDataContext);
    const handlers = useMemo(() => ({ onChoose: (pack: string) => onChange(pack), onNewDataSet: choices?.onManage }), [choices, onChange]);
    if (!choices) return <output>{value ?? ''}</output>;
    return <SampleDataPicker catalog={choices.catalog} activePack={typeof value === 'string' ? value : ''} labels={choices.labels} handlers={handlers} disabled={disabled} />;
};
