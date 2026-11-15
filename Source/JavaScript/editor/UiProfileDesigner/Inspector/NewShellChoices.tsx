// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NewShellStart } from '../Shell/ownShellDocument';
import type { EffectiveShell } from '@cratis/scene.engine';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

export interface NewShellChoicesProps {
    strings: UiProfileDesignerStrings;
    shell: EffectiveShell;
    appShell: EffectiveShell | undefined;
    onCreateShell: (start: NewShellStart, from: EffectiveShell) => Promise<string | undefined>;

    onMade: (id: string) => void;
}

export const NewShellChoices = ({ strings, shell, appShell, onCreateShell, onMade }: NewShellChoicesProps) => {
    const starts = [[NewShellStart.Blank, strings.shell.start.blank], [NewShellStart.CopyOfCurrent, strings.shell.start.copyOfCurrent], [NewShellStart.FromAppShell, strings.shell.start.fromAppShell]] as const;
    const create = (start: NewShellStart) => {
        void onCreateShell(start, start === NewShellStart.FromAppShell ? appShell! : shell).then(id => { if (id !== undefined) onMade(id); });
    };

    return (
        <div role='group' aria-label={strings.shell.create} className='studio-inspector-actions'>
            {starts.map(([start, label]) => (
                <button key={start} type='button' disabled={start === NewShellStart.FromAppShell && appShell === undefined} onClick={() => create(start)}>{label}</button>
            ))}
        </div>
    );
};
