// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import type { ApplicableTemplateSet } from '@cratis/scene.engine';
import { CascadeMenu } from '../CascadeMenu';
import { TemplateReference } from '../ScreenTemplates/TemplateReference';
import { TemplatePickerHandlers } from './TemplatePickerHandlers';
import { TemplatePickerLabels } from './TemplatePickerLabels';
import { describeTemplatePicker } from './describeTemplatePicker';

export interface TemplatePickerMenuProps {
    /** Where the menu opens: the control that was pressed. */
    anchor: DOMRect;

    /** The control that opened the menu. */
    trigger?: HTMLElement | null;

    /** What applies at the target - Scene's `applicableTemplates`. */
    applicable: ApplicableTemplateSet;

    /** The template in effect, which gets the check. */
    current?: TemplateReference;

    /** The labels to use. */
    labels: TemplatePickerLabels;

    /** What choosing does. */
    handlers: TemplatePickerHandlers;

    /** Called when the menu should go away. */
    onClose: () => void;
}

/**
 * The template picker's menu, for a host that has its own control to open it from - a header action, a row's caret.
 * Everything that chooses a template draws this one menu (spec TPL4): the levels of the board, the UI Profile default,
 * the screen editor's `template` property.
 */
export const TemplatePickerMenu = ({ anchor, trigger, applicable, current, labels, handlers, onClose }: TemplatePickerMenuProps) => {
    const [filter, setFilter] = useState('');
    const entries = useMemo(() => describeTemplatePicker(applicable, current, filter, labels, handlers), [applicable, current, filter, labels, handlers]);
    return (
        <CascadeMenu anchor={anchor} trigger={trigger} entries={entries} label={labels.menu} onClose={onClose}
            filter={{ value: filter, placeholder: labels.filter, onChange: setFilter }} />
    );
};
