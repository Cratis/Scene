// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { defaultDesignModeStrings } from '../DesignMode/DesignModeStrings';
import { useScreenOutlets } from '../DesignMode/Outlets/screenOutlets';
import { OutletSection } from './OutletSection';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface ScreenOutletsSectionProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
}

// The outlets the screen's template and layout offer - its toolbars, filters, tabs, stats and navigation - each with how the level being edited takes it,
// opened one at a time in the outlet design mode. A template that offers none shows nothing, and an outlet the page does not draw can still be edited here.
// The shell's own regions - the application's topbar and sidebar - are edited where they are drawn, in the shell navigation section above.
export const ScreenOutletsSection = ({ controller, environment, strings }: ScreenOutletsSectionProps) => {
    const text = (strings.designMode ?? defaultDesignModeStrings).outlets;
    const screenOutlets = useScreenOutlets(controller, environment, text);
    const [open, setOpen] = useState<string>();
    const outlets = screenOutlets.declared.filter(candidate => candidate.kind !== undefined && !candidate.shell && screenOutlets.design(candidate.name) !== undefined);
    if (outlets.length === 0) return null;

    if (open && outlets.some(candidate => candidate.name === open)) {
        return (
            <section className='studio-editor-properties__outlets' data-section='screenOutlets'>
                <button type='button' className='studio-editor-properties__back' onClick={() => setOpen(undefined)}>{text.template.outlets}</button>
                <OutletSection controller={controller} environment={environment} strings={strings} outlet={open} onChooseOutlet={setOpen} />
            </section>
        );
    }

    return (
        <section className='studio-editor-properties__outlets studio-editor-outlet__others' data-section='screenOutlets' aria-label={text.template.outlets}>
            <strong>{text.template.outlets}</strong>
            <ul>
                {outlets.map(candidate => {
                    const design = screenOutlets.design(candidate.name)!;
                    const own = design.items.filter(item => !item.readOnly && item.parentId === undefined).length;
                    return (
                        <li key={candidate.name} data-outlet={candidate.name}>
                            <button type='button' onClick={() => setOpen(candidate.name)}>
                                <span>{candidate.name}</span>
                                <small>{text.kinds[candidate.kind] ?? candidate.kind}</small>
                                <small data-outlet-mode={design.mode}>{text.modeOf[design.mode]}{own > 0 ? ` · ${text.added(own)}` : ''}</small>
                                <small>{design.effective.summary}</small>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};
