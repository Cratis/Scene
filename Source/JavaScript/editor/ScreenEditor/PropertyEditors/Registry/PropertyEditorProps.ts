// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentType } from 'react';
import type { ConfigurationDestination } from '@cratis/components/ConfigurationEditor';
import type { ApplicationStructure, InspectedProperty, PropertyDescriptor, QueryCandidate, QueryResultField, SceneDiagnostic, SceneDocument } from '@cratis/scene.model';
import type { EffectiveIconCatalog } from '@cratis/scene.engine';
import type { IconAdapterRegistry } from '@cratis/scene.react';
import type { BindingTypeScope } from '@cratis/scene.engine';
import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import type { PlacementEnvironment } from '../../Placement/hookPlacement';
import type { ScreenEditorController } from '../../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from '../../Inspector/ScreenEditorStrings';
import type { Ownership } from '../../Structure/Ownership';
import type { StructuredEditorStrings } from '../Structured/StructuredEditorStrings';
import type { PropertyEditorStrings } from './PropertyEditorStrings';
import type { IconPropertyFieldStrings } from '../../../Icons/IconPropertyFieldStrings';

// What an editor may ask about where it is being used - the same for the sidebar and, later, for a design-mode popover, so a
// property is edited by the same component wherever it is edited (PE3). It is data and lookups only: an editor never reaches into the
// editing session; it reports a value through `onChange` and the host turns that into a Scene edit.
export interface EditorContext {
    // The document being edited.
    model: SceneDocument;

    // The element the property belongs to, by id and component name; absent for a screen-level property.
    selection?: { id: string; component: string; properties: Readonly<Record<string, unknown>> };

    // Whether a screen is being edited or a template is being authored.
    level: 'screen' | 'template';

    // How the element sits in the structure: who owns it, and whether it is on a canvas.
    structure: { ownership?: Ownership; onCanvas: boolean };

    // What the host lends the editors: the slices, destinations and queries they offer, and the icons they draw.
    lookups: EditorLookups;

    // The words editors show.
    strings: EditorStrings;

    // The editing session the property belongs to, for the editors that change more than their own value - a collection of items, a query
    // binding. Absent where there is none; every other editor works from `value` and `onChange` alone.
    session?: EditorSession;
}

// The editing session an editor that is more than a value can reach: the controller applies Scene edits (so undo, redo and dirty state see
// them), and the inspected property is what Scene reported about it.
export interface EditorSession {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    property: InspectedProperty;
    bindingScope: BindingTypeScope;
    screenStrings: ScreenEditorStrings;

    // Asked once an inheritance mode moves from inherit to override and the author chose whether to copy the inherited items.
    copyInheritedItems?: (copy: boolean) => void;
}

export interface EditorLookups {
    // What a hook's Opens and Enabled are worked out against: the slices, the page's slots and what supplies a slice's inputs (StudioIssues#1331).
    placement?: PlacementEnvironment;

    // The State Change slices a button or a command can submit, with the origin that tells same-named ones apart.
    stateChangeSlices: readonly StateChangeSlice[];

    // Every slice of the model, with its kind, so a slice editor can list the ones its filter does not accept as disabled with a reason.
    slices: readonly EditorSlice[];

    // The screens (and other targets) an item can lead to, as a flat list grouped by `group` (Module > Feature).
    destinations: readonly ConfigurationDestination[];

    // The slots of the template in effect, for a rendering-slot editor.
    slots: readonly string[];

    // The modules and features of the application, for the editor of what a navigation item leads to.
    structure?: ApplicationStructure;

    // The module being edited - nothing at the application level - for the scope rule of what a navigation item may lead to.
    navigationModule?: string;

    // The collection queries the host offers.
    queryCandidates: readonly QueryCandidate[];

    // The values a binding can be drawn from, by path and type.
    availableSources: Readonly<Record<string, string>>;

    // The result fields of the shape the selected element is bound to, with the kind of each; empty when it is bound to nothing.
    fields: readonly QueryResultField[];

    // The theme tokens a colour editor offers first.
    colorTokens: readonly ColorToken[];

    // The icons the profile offers and what draws them.
    icons: { catalog: EffectiveIconCatalog; adapters: IconAdapterRegistry; diagnostics: readonly SceneDiagnostic[] };

    // The other items a `reference` editor can point at, by kind of target (`screen`, `template`, `sampleData` ...).
    references: (target: string) => readonly EditorReference[];
}

export interface EditorSlice {
    id: string;
    name: string;

    // The kind of the slice: `StateChange`, `ReadModel`, `StateView`, `Automation`, `Translator` ...
    kind: string;

    // The module and feature the slice sits in, outermost first - what the slice tree groups by.
    path: readonly string[];
}

export interface ColorToken {
    // The token as it is stored, for example `primary`.
    name: string;
    label: string;

    // The colour the token has in the current theme, for the swatch.
    value?: string;
}

export interface EditorReference {
    id: string;
    label: string;
    group?: string;
}

export interface EditorStrings {
    editors: PropertyEditorStrings;
    structured: StructuredEditorStrings;
    icon: IconPropertyFieldStrings;
    iconPicker: Record<string, string>;
}

// What every editor gets (spec section 8): the value, a way to change it, what describes the property, and where it is being used.
// `onChange(undefined)` unsets the property. Editors are controlled: they hold nothing the value does not.
export interface PropertyEditorProps<T = unknown> {
    value: T | undefined;
    onChange: (value: T | undefined) => void;
    descriptor: PropertyDescriptor;
    context: EditorContext;

    // Shown disabled, and still showing its value, when the property may not be changed (an inherited one, PE4).
    disabled?: boolean;

    // Why it may not be changed, when it may not.
    readOnlyReason?: string;

    // What the engine said is wrong with the current value (PE2), or the editor's own check of what was typed.
    problem?: EditorProblem;

    // Drawn open in place, with nothing to open first - in a popover that is itself the choice (the slice picker of a toolbar button).
    inline?: boolean;

    // Distinguishes the controls of editors drawn side by side, and names the label they are described by.
    id: string;
}

// An engine finding about a value: the code a host switches on and the message a person reads.
export interface EditorProblem {
    code: string;
    message: string;
}

// An editor as a component, which is what the registry loads.
export type PropertyEditor<T = unknown> = ComponentType<PropertyEditorProps<T>>;
