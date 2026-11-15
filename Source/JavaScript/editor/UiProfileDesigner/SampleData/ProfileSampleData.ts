// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext } from 'react';
import type { SampleDataPack } from '@cratis/scene.model';
import type { SampleDataCatalog } from '@cratis/scene.engine';
import type { SampleDataPickerLabels } from '../../SampleData/SampleDataPickerLabels';
import type { ApplyUiProfileResult } from '../../UiProfile/ApplyUiProfileResult';

// What the designer is given to choose and manage sample data with: the application's own packs and the read models their shapes may stand in
// for, and how to save and remove a pack. Absent where the host cannot store packs; the choice is then among Scene's own (generated, blueprints').
export interface ProfileSampleDataInput {
    packs: SampleDataPack[];
    readModels: string[];
    onSavePack: (pack: SampleDataPack) => Promise<ApplyUiProfileResult>;
    onRemovePack: (id: string) => Promise<ApplyUiProfileResult>;
}

// What the active-pack editor draws: Scene's catalog of what can be chosen (with the choice marked), and the words.
export interface ProfileSampleDataChoices {
    catalog: SampleDataCatalog;
    labels: SampleDataPickerLabels;

    // Opens the pack manager (the "New data set..." entry); absent when the host cannot store packs.
    onManage?: () => void;
}

export const ProfileSampleDataContext = createContext<ProfileSampleDataChoices | undefined>(undefined);
