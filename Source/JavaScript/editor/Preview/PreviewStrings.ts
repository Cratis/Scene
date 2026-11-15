// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataPickerLabels } from '../SampleData/SampleDataPickerLabels';
import { defaultLensStrings, type LensStrings } from './Lens/LensStrings';

/** The words of the preview strip and the preview's own messages. */
export interface PreviewStrings {
    /** The bold word that opens the strip. */
    previewing: string;

    /** What leads the sample data selector - `Sample data:`. */
    sampleData: string;

    /** The label of the exit button, with its key - `Exit preview · Esc`. */
    exit: string;

    /** The accessible label of the whole strip. */
    stripLabel: string;

    /** Said while the scene is being made. */
    preparing: string;

    /** Heading of the list of what stops the preview from rendering. */
    problems: string;

    /** The link to the offending node; `{node}` is its name. */
    showNode: string;

    /** The labels of the sample data selector in the strip, which is the one the UI Profile page uses. */
    picker: SampleDataPickerLabels;

    /** The words of the bindings lens; English when left out. */
    lens?: LensStrings;

    /** The words of the persona selector; English when left out. */
    persona?: PersonaStrings;
}

/** The words of the persona selector in the strip. */
export interface PersonaStrings {
    /** What leads the selector - `As persona:`. */
    label: string;

    /** The choice that looks as nobody in particular, which is how the preview starts. */
    nobody: string;

    /** The accessible name of the selector. */
    menu: string;

    /** What the lens says while a persona is chosen. `{persona}`. */
    lens: string;
}

export const defaultPersonaStrings: PersonaStrings = {
    label: 'As persona:',
    nobody: 'Nobody in particular',
    menu: 'Choose the persona to preview as',
    lens: 'As {persona}: what its policies do not allow is hidden or disabled, with the reason.',
};

/** English words, for stories and specs. */
export const defaultPreviewStrings: PreviewStrings = {
    previewing: 'Previewing',
    sampleData: 'Sample data:',
    exit: 'Exit preview · Esc',
    stripLabel: 'Preview',
    preparing: 'Preparing the preview…',
    problems: 'This cannot be previewed',
    showNode: 'Show {node}',
    picker: { menu: 'Choose sample data', generated: 'Generated', myDataSets: 'My data sets', blueprints: 'Blueprints', newDataSet: 'New data set...', unavailable: '{id} (not available)' },
    lens: defaultLensStrings,
    persona: defaultPersonaStrings,
};
