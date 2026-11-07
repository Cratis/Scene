// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, ReactNode, useContext } from 'react';
import { ActionSlice, EnablementPersona, OutletLevel, PlacementSlot } from '@cratis/scene.engine';

/**
 * What the outlets of a page resolve and act against: the chain of levels the page sits in, the slices its actions run,
 * its slots and route values, and the persona it is shown to. A host - Stage, the Studio preview - builds it from the
 * application; the renderer adds no rules of its own and asks the engine (`effectiveOutlet`, `inspectOutletActions`).
 */
export interface SceneOutletsContextValue {
    /** The levels of the page from the top down - layout, template, module, feature, slice, screen. */
    chain: OutletLevel[];

    /** Levels outside the chain that contribute to its outlets, such as another feature that adds a tab. */
    contributors?: OutletLevel[];

    /** The slices the page's actions run: their screen, what it fits, their inputs and authorization. */
    slices?: ActionSlice[];

    /** The slots of the page, as placement sees them (`placementSlotsOf`). */
    slots?: PlacementSlot[];

    /** The persona the page is shown to; absent leaves authorization unchecked. */
    persona?: EnablementPersona;

    /** Whether each action's `enabled when` holds, by action id, when the host evaluated it. */
    conditions?: Record<string, boolean>;

    /** The choices of each filter with the `choice` control, by filter id. */
    filterChoices?: Record<string, FilterChoice[]>;

    /** The dialog template a slice that names none opens in; `FormDialog` when absent. */
    defaultDialogTemplate?: string;
}

/** One choice of a filter with the `choice` control. */
export interface FilterChoice {
    /** The value written to the query parameter. */
    value: string;

    /** The text shown. */
    label: string;
}

const Context = createContext<SceneOutletsContextValue | undefined>(undefined);

export interface SceneOutletsProviderProps {
    value: SceneOutletsContextValue;
    children: ReactNode;
}

/** Gives the outlets inside it the page they resolve and act against. */
export function SceneOutletsProvider({ value, children }: SceneOutletsProviderProps) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** The page the outlets resolve against, or undefined outside a provider - an outlet then shows the items it carries. */
export function useSceneOutlets(): SceneOutletsContextValue | undefined {
    return useContext(Context);
}
