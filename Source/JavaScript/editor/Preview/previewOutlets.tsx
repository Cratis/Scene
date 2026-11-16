// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext, useMemo } from 'react';
import { CoreOutletItems, SceneOutletsProvider, componentRegistryKey, type ComponentRegistry, type RegisteredComponentProps, type SceneOutletsContextValue } from '@cratis/scene.react';
import { InputSourceKind, outletChainOf, placementSlotsOf, type ActionSlice, type PlacementSlot } from '@cratis/scene.engine';
import type { ApplicationStructure, SceneElement, Screen, Slot } from '@cratis/scene.model';
import { SliceKind } from '@cratis/scene.model';
import type { PreviewScene } from './PreviewScene';
import { authorizeOf, PreviewPersonaContext, type PreviewAuthorizations, type PreviewPersonaScope } from './previewPersona';

type StructureNode = { id: string; features?: StructureNode[]; slices?: { id: string; kind: SliceKind; command?: string }[] };

const hasElement = (elements: readonly SceneElement[] | undefined, id: string): boolean =>
    (elements ?? []).some(element => element.id === id || Object.values((element as { slots?: Record<string, SceneElement[]> }).slots ?? {}).some(children => hasElement(children, id)));

// The screen an element of the scene is drawn by.
export const screenOfElement = (screens: readonly Screen[], id: string): Screen | undefined =>
    screens.find(screen => Object.values(screen.slotContent).some(elements => hasElement(elements, id)));

const inputsOf = (schema: string | undefined): { name: string; source: InputSourceKind }[] => {
    if (!schema) return [];
    try {
        const parsed = JSON.parse(schema) as { properties?: Record<string, unknown> };
        // The preview shows no running data, so what a slice takes from the row it acts on or from the route is taken to be there: the toast it plays says what would be sent.
        return Object.keys(parsed.properties ?? {}).map(name => ({ name, source: InputSourceKind.DataContext }));
    } catch {
        return [];
    }
};

const walk = (nodes: readonly StructureNode[] | undefined, path: readonly string[], visit: (path: readonly string[], slice: NonNullable<StructureNode['slices']>[number]) => void) => {
    for (const node of nodes ?? []) {
        const here = [...path, node.id];
        for (const slice of node.slices ?? []) visit(here, slice);
        walk(node.features, here, visit);
    }
};

// The slices a hook of an outlet can run, as Scene's resolver is given them: the State Change slices of the structure by their dotted name, with the screen each owns and what the
// screen fits. Scene's preview host does not supply them to the outlets it draws (upstream gap), so a button that runs a slice could not be told from one that names nothing.
export function actionSlicesOf(scene: Pick<PreviewScene, 'structure' | 'screens' | 'commandSchemas'>, authorizations?: PreviewAuthorizations): ActionSlice[] {
    const slices: ActionSlice[] = [];
    const structure = scene.structure as ApplicationStructure & { modules?: StructureNode[] };
    walk(structure.modules as StructureNode[] | undefined, [], (path, slice) => {
        if (slice.kind !== SliceKind.StateChange) return;
        const id = [...path, slice.id].join('.');
        const owned = scene.screens.find(screen => screen.owner === id);
        const authorize = authorizeOf(authorizations?.get(id));
        slices.push({
            id,
            ...(authorize === undefined ? {} : { authorize }),
            ...(slice.command ? { command: slice.command } : {}),
            ...(owned ? { screen: owned.name, ...(owned.fits ? { fits: [...owned.fits] } : {}) } : {}),
            inputs: inputsOf(slice.command ? scene.commandSchemas?.[slice.command] : undefined),
        });
    });
    return slices;
}

export const slotsOfScreen = (scene: PreviewScene, screen: Screen): PlacementSlot[] => {
    const template = screen.screenTemplate ? scene.screenTemplates.find(candidate => candidate.name === screen.screenTemplate) : undefined;
    const slots: readonly Slot[] = template?.slots ?? scene.layouts.find(layout => layout.name === screen.layout)?.slots ?? [];
    return placementSlotsOf([...slots], Object.entries(screen.slotContent).filter(([, content]) => content.length > 0).map(([name]) => name));
};

// What the outlets of the page the element is on resolve against: the levels of the screen, the slices, and the slots of the page.
export function outletsValueOf(scene: PreviewScene, elementId: string, scope: PreviewPersonaScope = {}): SceneOutletsContextValue | undefined {
    const screen = screenOfElement(scene.screens, elementId);
    if (!screen) return undefined;
    const { chain, contributors } = outletChainOf({
        layouts: scene.layouts, screenTemplates: scene.screenTemplates, screens: scene.screens, ...(scene.navigation ? { navigation: scene.navigation } : {}),
    }, screen.name);
    if (chain.length === 0) return undefined;
    return { chain, contributors, slices: actionSlicesOf(scene, scope.authorizations), slots: slotsOfScreen(scene, screen), ...(scope.persona ? { persona: scope.persona } : {}) };
}

// Draws an outlet with what a hook of it needs to be placed, enabled and run, so a button that runs a slice directly plays in the preview as it does in the application.
export const previewOutletComponents = (scene: PreviewScene): ComponentRegistry => {
    function PreviewOutletItems(props: RegisteredComponentProps) {
        const scope = useContext(PreviewPersonaContext);
        const value = useMemo(() => outletsValueOf(scene, props.element.id, scope), [props.element.id, scope]);
        return value ? <SceneOutletsProvider value={value}><CoreOutletItems {...props} /></SceneOutletsProvider> : <CoreOutletItems {...props} />;
    }

    return { [componentRegistryKey('core', 'outletItems')]: PreviewOutletItems };
};
