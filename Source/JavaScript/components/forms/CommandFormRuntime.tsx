// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentType, ReactNode } from 'react';
import { AutoCommandForm } from '@cratis/components/CommandForm';
import { CommandForm } from '@cratis/arc.react/commands';
import { formWidthToCss, normalizeCommandFormLayout, stackCommandFormLayout, validateCommandFormLayout } from '@cratis/scene.engine';
import { Guid } from '@cratis/fundamentals';
import type { BoundConstructor } from '../bindings';
import type { CommandInput } from './commandInputs';
import type { CommandFormLayout } from '@cratis/scene.model';
import { CommandFormSubmit } from './CommandFormSubmit';
import { ExplicitCommandField } from './ExplicitCommandField';

interface CommandFormRuntimeProps {
    command: BoundConstructor;
    inputs?: CommandInput[];
    exclude?: string[];
    submitLabel: string;
    columns?: number;
    layout?: CommandFormLayout;

    /** At a compact width the fields stack in one column, in reading order. */
    compact?: boolean;
}

// Runtime bindings erase the proxy's keys; the optional footer is a Components >=4.13 contract.
const NativeAutoCommandForm = AutoCommandForm as unknown as ComponentType<{
    command: BoundConstructor;
    exclude?: string[];
    footer?: ReactNode;
}>;

type Descriptor = { name: string; type: unknown; isOptional: boolean };

/** Verify the whole command before mounting any native form: partial forms must never execute. */
function capability(command: BoundConstructor, inputs?: CommandInput[], exclude?: string[]): string | undefined {
    let descriptors: unknown;
    try { descriptors = (new command() as { propertyDescriptors?: unknown }).propertyDescriptors; }
    catch { return 'Unable to inspect command proxy'; }
    if (!Array.isArray(descriptors)) return 'Command proxy has no property descriptors';
    const byName = new Map<string, Descriptor>();
    for (const descriptor of descriptors) {
        if (!descriptor || typeof descriptor.name !== 'string' || !descriptor.name ||
            typeof descriptor.isOptional !== 'boolean' || byName.has(descriptor.name)) return 'Ambiguous or invalid command property descriptors';
        byName.set(descriptor.name, descriptor);
    }
    if (inputs) {
        for (const input of inputs) {
            const descriptor = byName.get(input.property);
            if (!descriptor) return `Unknown command property '${input.property}'`;
            if (descriptor.type !== (input.type === 'guid' ? Guid : String)) return `Command property '${input.property}' type does not match '${input.type}'`;
        }
        for (const descriptor of byName.values()) {
            if (!descriptor.isOptional && !inputs.some(input => input.property === descriptor.name)) return `Required command property '${descriptor.name}' has no input`;
        }
    } else {
        for (const descriptor of byName.values()) {
            if (!descriptor.isOptional && (exclude?.includes(descriptor.name) ||
                ![String, Number, Boolean, Date].includes(descriptor.type as typeof String))) {
                return `Required command property '${descriptor.name}' has no supported automatic field; declare inputs`;
            }
        }
    }
    return undefined;
}

/** Private lazy entry point: importing the Scene registry must not import Arc. */
export default function CommandFormRuntime({ command, inputs, exclude, submitLabel, columns = 1, layout, compact = false }: CommandFormRuntimeProps) {
    const error = capability(command, inputs, exclude);
    if (error) return <div role='alert'>{error}</div>;
    // The registry's never-argument constructor is erased; Arc creates this checked proxy with no args.
    if (inputs) {
        const authoredLayout = normalizeCommandFormLayout(layout, inputs);
        const diagnostics = validateCommandFormLayout(authoredLayout, inputs.map(input => input.property));
        if (diagnostics.length) return <div role='alert'>{diagnostics[0].message}</div>;
        const formLayout = compact ? stackCommandFormLayout(authoredLayout) : authoredLayout;
        const columnsCss = formLayout.columns.map(column => formWidthToCss(column.width) ?? 'minmax(0, 1fr)').join(' ') || `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`;
        return <CommandForm command={command as unknown as new () => object} showTitles={false}>
            <div data-scene-form-columns={formLayout.columns.length} style={{ display: 'grid', gridTemplateColumns: columnsCss, columnGap: formWidthToCss(formLayout.columnGap) ?? '1rem', rowGap: formWidthToCss(formLayout.rowGap) ?? '1rem' }}>
                {inputs.map(input => <ExplicitCommandField key={input.property} input={input} placement={formLayout.placements.find(placement => placement.field === input.property) ?? input.placement} />)}
            </div>
            <CommandFormSubmit label={submitLabel} />
        </CommandForm>;
    }
    return <NativeAutoCommandForm command={command} exclude={exclude} footer={<CommandFormSubmit label={submitLabel} />} />;
}
