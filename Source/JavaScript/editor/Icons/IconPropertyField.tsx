// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconPicker, IconPickerAllowed, IconPickerLabels, IconPickerPlacement } from '@cratis/components/IconPicker';
import { EffectiveIconCatalog } from '@cratis/scene.engine';
import { IconReference } from '@cratis/scene.model';
import { IconAdapterRegistry } from '@cratis/scene.react';
import { IconPropertyFieldStrings } from './IconPropertyFieldStrings';
import { describeIconValueProblem } from './describeIconValueProblem';
import { diagnoseIconValue } from './diagnoseIconValue';
import { useIconPickerCatalog } from './useIconPickerCatalog';

export interface IconPropertyFieldProps {
    value: IconReference | null | undefined;

    onChange: (value: IconReference) => void;

    catalog: EffectiveIconCatalog;

    adapters?: IconAdapterRegistry;

    allowed?: IconPickerAllowed;

    readOnly?: boolean;

    disabled?: boolean;

    validationMessage?: string;

    // Whether the field writes its message under itself. A host that already shows the message elsewhere, such as a row of
    // the ordered-item editor, turns it off: the field is still marked invalid, and the host's element describes it.
    showMessage?: boolean;

    // Marks the field invalid when the host knows something is wrong that the field itself cannot see.
    invalid?: boolean;

    strings: IconPropertyFieldStrings;

    pickerLabels?: IconPickerLabels;

    placement?: IconPickerPlacement;

    id?: string;

    'aria-label'?: string;

    'aria-labelledby'?: string;

    'aria-describedby'?: string;
}

// A property field for an icon, over Cratis Components' icon picker and Scene's effective icon catalog.
//
// It offers exactly the icons the profile's libraries ship, keeps same-named icons from different
// libraries apart by their qualified identity, and honours `allowed`, `readOnly` and `disabled`. A stored
// icon that its library no longer supplies is never replaced or dropped: the field marks itself invalid and
// says what is missing and how to repair it, and the user repairs it by choosing again.
export function IconPropertyField({ value, onChange, catalog, adapters, allowed, readOnly, disabled, validationMessage, showMessage = true, invalid, strings, pickerLabels, placement, id, ...aria }: IconPropertyFieldProps) {
    const { catalog: offered, loadedVersion } = useIconPickerCatalog(catalog, adapters);
    const problem = loadedVersion > 0 ? diagnoseIconValue(catalog, offered, value, allowed) : undefined;
    const message = validationMessage ?? (problem ? describeIconValueProblem(problem, strings) : undefined);

    return (
        <IconPicker
            id={id}
            value={value}
            onChange={chosen => onChange({ library: chosen.library, key: chosen.key, ...(chosen.variant === undefined ? {} : { variant: chosen.variant }) })}
            catalog={offered}
            allowed={allowed}
            readOnly={readOnly}
            disabled={disabled}
            invalid={message !== undefined || invalid === true}
            validationMessage={showMessage ? message : undefined}
            placement={placement}
            labels={{ ...strings.picker, ...pickerLabels }}
            aria-label={aria['aria-label'] ?? (aria['aria-labelledby'] ? undefined : strings.ariaLabel)}
            aria-labelledby={aria['aria-labelledby']}
            aria-describedby={aria['aria-describedby']}
        />
    );
}
