// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { layoutCatalog } from '../Layouts/layoutCatalog';
import type { LayoutLabels } from '../Layouts/toLayoutContainerDescriptors';
import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import type { PaletteIcons, PaletteSource } from './buildPalette';
import { buildPickerEntries, type PickerEntry } from './componentPickerModel';
import { createComponentPickerMemory, type ComponentPickerMemory } from './componentPickerStorage';
import { PaletteFolders } from './PaletteFolders';

export interface ComponentPaletteInputs {
    strings: ScreenEditorStrings;
    layoutLabels: LayoutLabels;
    icons: PaletteIcons;
    paletteSources: readonly PaletteSource[];

    // Adds the entry at the selection; what that means is the host editor's.
    onAdd: (entry: PickerEntry) => void;
    memory?: ComponentPickerMemory;
    // For a toolbar that names its buttons: the button carries its name and, when the screen cannot be edited, is disabled with the reason.
    labelled?: boolean;
    disabled?: boolean;
    disabledReason?: string;
}

// The palette of an editor: the picker's entries worked out from the packages' descriptors, its memory (how often each component was added, which groups
// are open), and the folder that draws it. `recordInserted` goes to the editor's controller, so a component counts as used when it is on the screen -
// however it got there - and the picker reorders "Frequently used" at once.
export function useComponentPalette({ strings, layoutLabels, icons, paletteSources, onAdd, memory: given, labelled, disabled, disabledReason }: ComponentPaletteInputs): { palette: ReactNode; recordInserted: (key: string) => void } {
    const memory = useMemo(() => given ?? createComponentPickerMemory(), [given]);
    const [usageVersion, setUsageVersion] = useState(0);
    const entries = useMemo(
        () => buildPickerEntries(paletteSources, layoutCatalog.map(entry => ({ item: entry.item, label: layoutLabels[entry.item] })), strings.packageTitles),
        [paletteSources, layoutLabels, strings.packageTitles]);
    const recordInserted = useCallback((key: string) => { memory.recordAdded(key); setUsageVersion(version => version + 1); }, [memory]);

    const palette = (
        <PaletteFolders
            entries={entries} memory={memory} usageVersion={usageVersion} icon={icons.drawer.layout} title={strings.componentsDrawer} closeLabel={strings.closeDrawer}
            {...(strings.picker ? { strings: strings.picker } : {})} {...(labelled ? { labelled } : {})} {...(disabled !== undefined ? { disabled } : {})} {...(disabledReason ? { disabledReason } : {})} onAdd={onAdd} />
    );

    return { palette, recordInserted };
}
