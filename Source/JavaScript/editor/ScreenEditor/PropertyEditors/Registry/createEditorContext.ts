// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { slicesOfStructure } from '../../Toolbar/slicesOfStructure';
import type { InspectedProperty, QueryCandidate, QueryResultField, SceneDiagnostic } from '@cratis/scene.model';
import type { BindingTypeScope } from '@cratis/scene.engine';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import type { ScreenEditorController } from '../../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from '../../Inspector/ScreenEditorStrings';
import type { Ownership } from '../../Structure/Ownership';
import { defaultStructuredEditorStrings } from '../Structured/defaultStructuredEditorStrings';
import type { EditorContext, EditorLookups } from './PropertyEditorProps';
import { defaultPropertyEditorStrings } from './PropertyEditorStrings';
import { placementEnvironmentOf } from '../../Placement/placementEnvironment';
import { screenName } from '../../Document/studioScreen';

// What the editors of a selection read of the session. A host that edits no session - the outlets of a level, drawn in place on a template - supplies this much.
export type EditorControllerView = Pick<ScreenEditorController, 'selection' | 'selectedId' | 'inspection' | 'document' | 'structure' | 'navigationModule'>;

export interface EditorContextInputs<TController extends EditorControllerView = ScreenEditorController> {
    controller: TController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    ownership: Ownership | undefined;
    authoringTemplate?: string;
    diagnostics: readonly SceneDiagnostic[];
    inCanvas: boolean;
    bindingScope: BindingTypeScope;

    // What a slot is called to the author, by its name (`content` is the main area), for the editors of where a navigation item renders.
    slotNames?: Readonly<Record<string, string>>;
}

// The result fields of the shape an element is bound to: those of the query its `query` property names, empty when it is bound to nothing or to a
// query the host does not offer. This is what a `field` editor lists.
export function fieldsOfBoundQuery(properties: Readonly<Record<string, unknown>> | undefined, candidates: readonly QueryCandidate[]): readonly QueryResultField[] {
    const binding = properties?.query;
    const queryId = binding !== null && typeof binding === 'object' && 'queryId' in binding ? (binding as { queryId?: unknown }).queryId : undefined;
    return typeof queryId === 'string' ? candidates.find(candidate => candidate.id === queryId)?.resultFields ?? [] : [];
}

// What the editors of the selection may ask about where they are used. The same context serves the sidebar and, later, a design-mode popover; the
// session of one property is added with `withSession`, because only the editors that change more than their own value need it.
export function createEditorContext(inputs: EditorContextInputs<EditorControllerView>): EditorContext {
    const { controller, environment, strings, ownership, authoringTemplate, diagnostics, inCanvas } = inputs;
    const selection = controller.selection;
    const properties = (selection as { properties?: Record<string, unknown> } | undefined)?.properties ?? {};
    const hosted = environment.propertyEditors;
    const { runtime } = environment;

    const lookups: EditorLookups = {
        placement: placementEnvironmentOf({
            document: controller.document,
            screen: screenName,
            slices: environment.stateChangeSlices,
            queries: environment.queryCandidates,
            templates: [...(environment.ownTemplates ?? []), ...runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? [])],
            layouts: runtime.bundles.flatMap(bundle => bundle.layouts ?? []),
        }),
        stateChangeSlices: environment.stateChangeSlices,
        // The slice tree of the application - every module's slices, whatever their kind - unless the host gives its own.
        slices: hosted?.slices ?? slicesOfStructure(controller.structure),
        destinations: environment.destinations,
        slots: hosted?.slots ?? environment.navigation?.slots ?? [],
        structure: controller.structure,
        ...(controller.navigationModule !== undefined ? { navigationModule: controller.navigationModule } : {}),
        queryCandidates: environment.queryCandidates,
        availableSources: environment.availableSources,
        fields: fieldsOfBoundQuery(properties, environment.queryCandidates),
        colorTokens: hosted?.colorTokens ?? [],
        icons: { catalog: runtime.icons, adapters: runtime.iconAdapters, diagnostics },
        references: target => hosted?.references?.(target) ?? [],
    };

    const text = strings.properties;
    const editors = text.editors ?? defaultPropertyEditorStrings;
    return {
        model: controller.document,
        ...(selection && controller.selectedId ? { selection: { id: controller.selectedId, component: controller.inspection?.typeId ?? '', properties } } : {}),
        level: authoringTemplate ? 'template' : 'screen',
        structure: { ...(ownership ? { ownership } : {}), onCanvas: inCanvas },
        lookups,
        strings: {
            editors: inputs.slotNames ? { ...editors, renderingSlot: { ...editors.renderingSlot, names: inputs.slotNames } } : editors,
            structured: text.structured ?? defaultStructuredEditorStrings,
            icon: text.icon,
            iconPicker: (text.iconPickerLabels ?? defaultScreenEditorStrings.properties.iconPickerLabels ?? {}) as unknown as Record<string, string>,
        },
    };
}

export function withSession(context: EditorContext, inputs: EditorContextInputs, property: InspectedProperty): EditorContext {
    return {
        ...context,
        session: { controller: inputs.controller, environment: inputs.environment, property, bindingScope: inputs.bindingScope, screenStrings: inputs.strings },
    };
}
