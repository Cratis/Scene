// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultPlacementStrings, type PlacementStrings } from '../../Placement/PlacementStrings';

// The words the property editors show. A host that localises the editor passes its own; the defaults are English.
export interface PropertyEditorStrings {
    // Where a hook opens its slice and when it is enabled.
    placement: PlacementStrings;
    // The one-line reason an editor is disabled when the host gave none.
    readOnly: string;
    inherited: string;
    unresolved: string;
    undescribed: (label: string) => string;
    cannotLoad: (label: string) => string;
    loading: string;

    select: { placeholder: string; search: string; empty: string; clear: string; notAvailable: (kind: string) => string };
    text: { placeholder: string };
    number: { invalid: string };
    color: { tokens: string; custom: string; clear: string; hex: string };
    list: { add: string; remove: string; moveUp: string; moveDown: string };
    navigationTarget: { placeholder: string; unresolved: (target: string) => string };
    navigationItemTarget: { notLinked: string; module: string; unresolved: (target: string) => string; outOfScope: string };
    renderingSlot: { none: string; diagram: (slot: string) => string; names: Readonly<Record<string, string>> };
    slice: { placeholder: string; notKind: (kind: string) => string; kindName: (kind: string) => string; sections: { accepted: string; refused: string } };
    inheritanceMode: {
        modes: Record<'inherit' | 'extend' | 'override', { label: string; effect: string }>;
        copyPrompt: string;
        copyYes: string;
        copyNo: string;
    };
    field: { placeholder: string; typed: (kind: string) => string };
    columnList: { add: string; remove: string; field: string; header: string; width: string; align: string; format: string; alignments: Record<'start' | 'center' | 'end', string> };
    summary: { editedBy: (owner: string) => string; empty: string };
}

export const defaultPropertyEditorStrings: PropertyEditorStrings = {
    placement: defaultPlacementStrings,
    readOnly: 'This property cannot be changed here.',
    inherited: 'Inherited - change it where it is defined.',
    unresolved: 'Unresolved',
    undescribed: label => `Nothing describes the shape of ${label}, so it cannot be edited. Describe it in the component's descriptor.`,
    cannotLoad: label => `The editor for ${label} could not be loaded.`,
    loading: 'Loading editor…',

    select: { placeholder: 'Choose…', search: 'Filter', empty: 'Nothing matches', clear: 'Clear', notAvailable: kind => `Not a ${kind}` },
    text: { placeholder: '' },
    number: { invalid: 'Enter a number' },
    color: { tokens: 'Theme', custom: 'Custom', clear: 'No colour', hex: 'Hex colour' },
    list: { add: 'Add', remove: 'Remove', moveUp: 'Move up', moveDown: 'Move down' },
    navigationTarget: { placeholder: 'Choose a target', unresolved: target => `${target} no longer exists` },
    navigationItemTarget: { notLinked: 'Not linked', module: 'module', unresolved: target => `${target} no longer exists`, outOfScope: "A module's own items can only link to that module" },
    renderingSlot: { none: 'The template has no slots', diagram: slot => `The ${slot} slot of the template`, names: {} },
    slice: {
        placeholder: 'Choose a slice',
        notKind: kind => `Not a ${kind}`,
        // `StateChange` reads as "State Change": the kinds of Scene's slices are written without spaces.
        kindName: kind => kind.replace(/([a-z])([A-Z])/g, '$1 $2'),
        sections: { accepted: 'State Change slices', refused: 'Not invokable from a button' },
    },
    inheritanceMode: {
        modes: {
            inherit: { label: 'Inherit', effect: 'Shows the items of the level above, unchanged.' },
            extend: { label: 'Extend', effect: 'Shows the items of the level above, then its own.' },
            override: { label: 'Override', effect: 'Replaces the items of the level above with its own.' },
        },
        copyPrompt: 'Copy application items?',
        copyYes: 'Copy them',
        copyNo: 'Start empty',
    },
    field: { placeholder: 'Choose a field', typed: kind => `${kind} fields` },
    columnList: {
        add: 'Add column', remove: 'Remove column', field: 'Field', header: 'Header', width: 'Width', align: 'Align', format: 'Format',
        alignments: { start: 'Start', center: 'Center', end: 'End' },
    },
    summary: { editedBy: owner => `Edited in ${owner}`, empty: 'Not set' },
};
