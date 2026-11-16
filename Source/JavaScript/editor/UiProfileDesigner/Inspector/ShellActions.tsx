// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { TemplateReference } from '@cratis/scene.model';
import type { ShellHost } from '../Shell/ShellHost';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

export interface ShellActionsProps {
    host: ShellHost | undefined;
    shellReference: TemplateReference | undefined;
    isOwn: boolean;
    creating: boolean;
    strings: UiProfileDesignerStrings;
    onChange: () => void;
    onToggleCreate: () => void;
}

export const ShellActions = ({ host, shellReference, isOwn, creating, strings, onChange, onToggleCreate }: ShellActionsProps) => (
    <div className='studio-inspector-actions'>
        {host?.browser && <button type='button' onClick={onChange}>{strings.editor.shell.change}</button>}
        {host?.onEditShell && shellReference !== undefined && (
            <button type='button' onClick={() => host.onEditShell!(shellReference, isOwn)}>{isOwn ? strings.shell.edit : strings.shell.editBlueprintCopy}</button>
        )}
        {host?.onCreateShell && <button type='button' aria-expanded={creating} onClick={onToggleCreate}>{strings.shell.create}</button>}
    </div>
);
