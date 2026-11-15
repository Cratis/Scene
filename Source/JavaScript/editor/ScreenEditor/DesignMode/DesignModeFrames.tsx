// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useMemo, type RefObject } from 'react';
import type { SceneElement } from '@cratis/scene.model';
import { effectiveNavigation, findComponentDescriptor, isExternalComponent, type DescriptorCatalog } from '@cratis/scene.engine';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import { childrenOfElement } from '../Selection/sceneTree';
import { elementRect, type SurfaceOrigin } from '../Surface/elementRect';
import type { Rect } from '../Surface/dropRegionRects';
import { elementItemKinds } from './elementItemSource';
import { regionOf } from './useDesignMode';
import type { ScreenOutlets } from './Outlets/screenOutlets';
import { useSurfaceMeasured } from './useDesignModeMeasurement';
import type { DesignModeStrings } from './DesignModeStrings';
import './DesignModeChrome.css';

interface Frame {
    id: string;
    name: string;

    // A topbar or a sidebar: its frame is the region itself, tagged with where its items come from (NAV13), not a box around a list of items.
    region?: 'topbar' | 'sidebar';

    // The outlet an element draws, by name: its frame says its kind, and its tag where its items come from (StudioIssues#1330).
    outlet?: string;
}

interface PlacedFrame extends Frame {
    rect: Rect;
}

const room = 6;

// The design-mode components that are drawn as a frame: a toolbar's buttons and a navigation bar's items sit in a box of their own, and a topbar or a sidebar is a region.
function framedComponents(roots: readonly SceneElement[], catalog: DescriptorCatalog): Frame[] {
    return roots.flatMap(element => {
        const componentName = isExternalComponent(element as never) ? (element as unknown as { componentName: string }).componentName : undefined;
        const own = componentName ? findComponentDescriptor(catalog, componentName) : undefined;
        const mode = own?.designMode;
        const region = componentName ? regionOf(componentName) : undefined;
        const framed = mode && mode.addActions.length > 0 && (region !== undefined || mode.itemsPath !== undefined || elementItemKinds[mode.addActions[0].id] !== undefined);
        const outletName = componentName && /(^|:)outletItems$/.test(componentName) ? (element as unknown as { properties?: Record<string, unknown> }).properties?.name : undefined;
        const outlet = typeof outletName === 'string' && outletName !== '' ? outletName : undefined;
        const frame: Frame[] = framed ? [{ id: (element as { id: string }).id, name: own?.displayName ?? own?.component ?? '', ...(region ? { region } : {}), ...(outlet ? { outlet } : {}) }] : [];
        return [...frame, ...framedComponents(childrenOfElement(element), catalog)];
    });
}

const sameRect = (a: Rect, b: Rect) => a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;

// The slot of the layout the screen fills.
const slotName = 'content';

const sameFrames = (a: PlacedFrame[], b: PlacedFrame[]) =>
    a.length === b.length && a.every((frame, index) => frame.id === b[index].id && frame.rect.left === b[index].rect.left && frame.rect.top === b[index].rect.top && frame.rect.width === b[index].rect.width && frame.rect.height === b[index].rect.height);

export interface DesignModeFramesProps {
    surface: RefObject<HTMLDivElement | null>;
    controller: ScreenEditorController;
    strings: DesignModeStrings;

    // The outlets of the screen as the level being edited sees them.
    outlets?: ScreenOutlets;
}

// The light dashed box around each toolbar and navigation list of the screen, with its name on its edge: where the items go, so an empty or narrow one can still be seen,
// and what it is (p11-1). A topbar and a sidebar are not boxed but tagged: the tag says where their items come from - `defined here`, `inherited`, `Application + Sales`,
// `Sales only` - as Scene resolves it, updating as the mode changes, and the selected region is outlined in blue (p12-3, p13-3). It is chrome - drawn over the screen, never
// part of it - and so is not in preview or Stage.
export const DesignModeFrames = ({ surface, controller, strings, outlets }: DesignModeFramesProps) => {
    // The slot the screen fills: a dashed near-black outline with its name in a mono pill inside its top-right corner (p12-1, p13-3); the slot is where the screen's own
    // content goes, so it is drawn around the whole composition the surface renders.
    const slotArea = useSurfaceMeasured(surface, useCallback((root: HTMLDivElement, origin: SurfaceOrigin) => elementRect(root, 'composition', origin), []), sameRect);
    const { composition, context, selectedId, navigation, navigationModule, structure } = controller;
    const frames = useMemo(() => framedComponents(composition.roots, context.catalog), [composition.roots, context.catalog]);
    const compute = useCallback((root: HTMLDivElement, origin: SurfaceOrigin): PlacedFrame[] =>
        frames.flatMap(frame => {
            const rect = elementRect(root, frame.id, origin);
            return rect ? [{ ...frame, rect }] : [];
        }), [frames]);
    const placed = useSurfaceMeasured(surface, compute, sameFrames);

    return (
        <>
            {slotArea && (
                <div className='studio-design-slot' data-slot={slotName} aria-hidden='true' style={{ left: slotArea.left, top: slotArea.top, width: slotArea.width, height: slotArea.height }}>
                    <span className='studio-design-slot__name'>{strings.slotName(slotName)}</span>
                </div>
            )}
            {placed?.map(({ id, name, region, outlet, rect }) => {
                if (region) {
                    const sources = effectiveNavigation(structure, navigation, navigationModule, region as never).sources;
                    return (
                        <div
                            key={id} className='studio-design-region' data-region={region} data-selected={id === selectedId ? 'true' : undefined} data-frame-for={id} aria-hidden='true'
                            style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
                            <span className='studio-design-region__tag' data-sources={sources.kind} title={strings.navigation.tagLong(region, sources.label)}>{sources.label}</span>
                        </div>
                    );
                }
                const design = outlet ? outlets?.design(outlet) : undefined;
                return (
                    <div key={id} className='studio-design-frame' data-frame-for={id} data-outlet={design?.name} data-outlet-kind={design?.outletKind} aria-hidden='true' style={{ left: rect.left - room, top: rect.top - room, width: rect.width + room * 2, height: rect.height + room * 2 }}>
                        <span className='studio-design-frame__name'>{design ? strings.outlets.frameName(design.name, strings.outlets.kinds[design.outletKind] ?? design.outletKind) : name}</span>
                        {design && <span className='studio-design-region__tag studio-design-frame__tag' data-sources={design.mode} title={strings.outlets.tagLong(design.name, design.effective.summary)}>{design.effective.summary}</span>}
                    </div>
                );
            })}
        </>
    );
};
