// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import { MenuPopover } from '../Menu/MenuPopover';
import { ComponentPicker, type ComponentPickerStrings } from './ComponentPicker';
import type { PickerEntry } from './componentPickerModel';
import type { ComponentPickerMemory } from './componentPickerStorage';
import './PaletteFolders.css';

export interface PaletteFoldersProps {
    entries: readonly PickerEntry[];
    memory: ComponentPickerMemory;

    // The icon on the folder's button and the words on the drawer.
    icon: ReactNode;
    title: string;
    closeLabel: string;
    strings?: ComponentPickerStrings;
    usageVersion: number;
    // Draws the button with its name beside the icon, and can disable it with the reason shown as its title.
    labelled?: boolean;
    disabled?: boolean;
    disabledReason?: string;
    onAdd: (entry: PickerEntry) => void;
}

// The palette: one folder whose drawer is the component picker (spec section 9) - a filter, Frequently used and a group per category - in place of a
// drawer per package. What is added, by click, Enter or drag, is the same payload the surface has always accepted.
export const PaletteFolders = ({ entries, memory, icon, title, closeLabel, strings, usageVersion, labelled = false, disabled, disabledReason, onAdd }: PaletteFoldersProps) => (
    <MenuPopover className='studio-palette-folder studio-palette-folder--picker' icon={icon} title={title} heading={title} closeLabel={closeLabel} {...(labelled ? { label: title } : {})} {...(disabled !== undefined ? { disabled } : {})} {...(disabledReason ? { disabledReason } : {})}>
        <ComponentPicker entries={entries} memory={memory} usageVersion={usageVersion} onAdd={onAdd} {...(strings ? { strings } : {})} />
    </MenuPopover>
);
