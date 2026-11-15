// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isIconReference, type IconReference } from '@cratis/scene.model';
import { IconPropertyField } from '../../../Icons/IconPropertyField';
import { allowedIconChoices } from '../../Properties/allowedIconChoices';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// An icon from the searchable grid, drawn by the shared icon field - the same one the ordered-item editor uses for an item's icon.
export const IconEditor = ({ value, onChange, descriptor, context, disabled, problem, id }: PropertyEditorProps<IconReference>) => {
    const { icons } = context.lookups;
    return (
        <IconPropertyField
            id={id}
            value={isIconReference(value) ? value : undefined}
            onChange={icon => onChange(icon)}
            catalog={icons.catalog}
            adapters={icons.adapters}
            allowed={allowedIconChoices(descriptor.choices)}
            readOnly={disabled}
            validationMessage={problem?.message}
            strings={context.strings.icon}
            pickerLabels={context.strings.iconPicker}
            aria-labelledby={`${id}-label`}
        />
    );
};
