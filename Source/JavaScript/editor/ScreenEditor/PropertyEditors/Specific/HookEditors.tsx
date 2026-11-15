// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens } from '@cratis/scene.model';
import { HookEnabledField } from '../../Placement/HookEnabledField';
import { HookOpensField } from '../../Placement/HookOpensField';
import type { HookEnabledValue, HookOpensValue } from '../../Placement/hookBinding';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// Where the hook the property belongs to opens its slice: the choices of 6e, each with the reason Scene gives. The value is the hook's own and the way it opens -
// `automatic`, `none`, `dialog`, `drawer` or `slot:<name>`; what the editor hands back is the way it opens alone.
export const HookOpensEditor = ({ value, onChange, context, disabled }: PropertyEditorProps<HookOpensValue>) => (
    <HookOpensField
        hook={{ ...value?.hook, ...opensOf(value?.value) }}
        environment={context.lookups.placement}
        strings={context.strings.editors.placement}
        disabled={disabled}
        onChange={chosen => onChange({ value: chosen, hook: value?.hook ?? {} })} />
);

const opensOf = (chosen: string | undefined): { opens?: Opens; opensIn?: string } => {
    if (chosen === undefined || chosen === Opens.Automatic) return {};
    if (!chosen.startsWith(Opens.Slot)) return { opens: chosen as Opens };
    return { opens: Opens.Slot, ...(chosen.length > 'slot:'.length ? { opensIn: chosen.slice('slot:'.length) } : {}) };
};

// When the hook is enabled: what it acts on and the condition it adds, with every check Enabled is derived from (6h).
export const HookEnabledEditor = ({ value, onChange, context, disabled }: PropertyEditorProps<HookEnabledValue>) => (
    <HookEnabledField
        hook={value?.hook ?? {}}
        environment={context.lookups.placement}
        strings={context.strings.editors.placement}
        disabled={disabled}
        {...(value?.outletSubject ? { outletSubject: value.outletSubject } : {})}
        value={{ ...(value?.subject ? { subject: value.subject } : {}), ...(value?.enabledWhen ? { enabledWhen: value.enabledWhen } : {}) }}
        onChange={changed => onChange({ ...changed, hook: value?.hook ?? {} })} />
);
