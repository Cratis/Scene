// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavigationRegionKind, type DestinationReference } from '@cratis/scene.model';
import { elementNodeId, inspect } from '@cratis/scene.engine';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import { nextElementId } from '../Host/nextElementId';
import { applyPlanSelection, regionStringsOf } from './designModeSelection';
import { actionAnnouncement, refusalReasonOf } from './designModeAnnouncements';
import { refusedFeedback } from './designModeFeedback';
import { DesignModeItemSourceKind, isRejection, type DesignModeItem, type DesignModePlan, type DesignModeRejection, type DesignModeSubject } from './designModeTypes';
import type { DesignModeStrings } from './DesignModeStrings';
import { resolveDesignMode, type DesignModeInputs } from './resolveDesignMode';
import { createRegionItemSource } from './Navigation/regionItemSource';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { useScreenOutlets, type ScreenOutlets } from './Outlets/screenOutlets';

export interface DesignModeOptions {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: DesignModeStrings;

    // The titles a new button and a new item start with.
    startingLabels: { button: string; item: string };

    // Where a new item that must lead somewhere leads, until the author chooses.
    startingDestination?: DestinationReference;

    // The items of a component that holds none as elements or rows - the navigation regions (#662).
    otherSource?: DesignModeInputs['otherSource'];
}

export interface DesignModeState {

    // The design-mode component and its items while it, or one of its items, is selected; nothing otherwise (DM1).
    subject: DesignModeSubject | undefined;

    // Why nothing can be added or changed, when the screen is open to be read only; absent while it can be edited.
    readOnlyReason?: string;

    // Counts up each time a new item asks for its title to be typed over; the toolbar's title field answers by taking focus.
    renameToken: number;

    // What was last said about an action - spoken politely, and shown as a note when an action was refused.
    announcement: string;

    // What the author is told, in a toast, because an action did more than was asked ("Region now extends the inherited items").
    notice: string;

    // The pointer pressed an item of a component: the item that is now selected.
    pointItem: (componentId: string | undefined, itemId: string | undefined) => void;

    // Carries out what an action came to as one undo step and moves the selection to what it names.
    perform: (outcome: DesignModePlan | DesignModeRejection, announce?: (plan: DesignModePlan) => string) => boolean;

    // The "+" of the design-mode component, and the actions on an item of it.
    add: (actionId: string) => boolean;
    act: (actionId: string, item: DesignModeItem) => boolean;
    rename: (item: DesignModeItem, label: string) => boolean;

    // Deselects the item first, then the component: Esc (DM7).
    deselect: () => void;

    // The outlets of the screen, as the level being edited sees them: what the surface draws and the frames tag.
    outlets?: ScreenOutlets;
}

// The design mode of what is selected: which component it belongs to, what its items are and what each action does to them. The chrome reads
// it and draws; every action is carried out here as an ordinary Scene edit through the controller (DM8) - undo, redo and the dirty state see
// nothing else, and nothing is stored in the component itself.
export function useDesignMode({ controller, environment, strings, startingLabels, startingDestination, otherSource }: DesignModeOptions): DesignModeState {
    const [renameToken, setRenameToken] = useState(0);
    const [announcement, setAnnouncement] = useState('');
    const [notice, setNotice] = useState('');
    useNoticeExpiry(notice, setNotice);

    // The item selected inside a component that does not hold its items as elements belongs to the controller, so the Properties tab sees it too.
    const { document, composition, context, selectedId, ownershipOf, selectedItemId, navigation, navigationModule, structure } = controller;
    const slots = environment.navigation?.slots ?? environment.propertyEditors?.slots ?? defaultSlots;

    // The items of a topbar or a sidebar: the navigation of the application as Scene resolves it for the module being edited.
    const regionSource = useCallback<NonNullable<DesignModeInputs['otherSource']>>(component => {
        const region = regionOf(component.componentName);
        return region ? createRegionItemSource({ region, module: navigationModule, navigation, structure, newId: nextElementId, slots, startingLabel: startingLabels.item, strings: regionStringsOf(strings) }) : otherSource?.(component, selectedItemId);
    }, [navigationModule, navigation, structure, slots, startingLabels, strings, otherSource, selectedItemId]);

    // The outlet an element draws, as the level being edited sees it (StudioIssues#1330).
    const screenOutlets = useScreenOutlets(controller, environment, strings.outlets);
    const outletDesign = useCallback<NonNullable<DesignModeInputs['outletDesign']>>(component => {
        const name = (component as { properties?: Record<string, unknown> }).properties?.name;
        return typeof name === 'string' && name !== '' ? screenOutlets.design(name) : undefined;
    }, [screenOutlets]);

    const subject = useMemo(() => resolveDesignMode({
        roots: composition.roots,
        catalog: context.catalog,
        selectedId,
        selectedItemId,
        ownershipOf,
        newId: nextElementId,
        inspect: id => inspect(document, elementNodeId(id), context),
        startingLabels,
        structure,
        ...(startingDestination ? { startingDestination } : {}),
        otherSource: regionSource,
        outletDesign,
    }), [composition, context, selectedId, selectedItemId, ownershipOf, document, startingLabels, startingDestination, structure, regionSource, outletDesign]);

    const pointItem = controller.selectItem;

    const refuse = useCallback((message: string) => { const feedback = refusedFeedback(message); setAnnouncement(feedback.announcement); setNotice(feedback.notice); }, []);

    const perform = useCallback((outcome: DesignModePlan | DesignModeRejection, announce?: (plan: DesignModePlan) => string): boolean => {
        if (isRejection(outcome)) {
            // Said aloud and shown: the announcement is for a screen reader and is not drawn, so the person who pressed "+" would otherwise see nothing happen.
            refuse(strings.announce.refused(outcome.rejected));
            return false;
        }

        // Editing where what a module inherits is defined: the editor moves to the application level, keeping what is selected.
        if (outcome.editAtApplication) {
            controller.setNavigationModule(undefined);
            controller.selectItem(undefined, undefined);
            return true;
        }

        // Navigation edits and Scene edits are one user action and one undo step; the navigation model is part of the document the session holds.
        const result = outcome.documentChange
            ? controller.changeDocument(outcome.documentChange, outcome.label)
            : outcome.navigationEdits
                ? controller.applyNavigationEdits(outcome.navigationEdits, outcome.label)
                : controller.applyAll(outcome.edits, outcome.label);
        if (!result.applied) {
            refuse(strings.announce.refused(refusalReasonOf(result, outcome.label)));
            return false;
        }

        applyPlanSelection(controller, outcome.select, subject?.componentId ?? selectedId);
        if (outcome.notice) { setAnnouncement(outcome.notice); setNotice(outcome.notice); }
        if (outcome.renameNext) setRenameToken(token => token + 1);
        if (announce && !outcome.notice) setAnnouncement(announce(outcome));
        return true;
    }, [controller, strings, subject, selectedId, refuse]);

    const add = useCallback((actionId: string) => {
        if (!subject) { refuse(strings.announce.nothingToAdd); return false; }
        const label = subject.source.kind === DesignModeItemSourceKind.Elements ? startingLabels.button : startingLabels.item;
        return perform(subject.source.add(actionId), () => strings.announce.added(label));
    }, [subject, perform, strings, startingLabels, refuse]);

    const act = useCallback((actionId: string, item: DesignModeItem) => {
        if (!subject) return false;
        return perform(subject.source.act(actionId, item), () => actionAnnouncement(strings, actionId, item));
    }, [subject, perform, strings]);

    const rename = useCallback((item: DesignModeItem, label: string) => subject ? perform(subject.source.rename(item, label)) : false, [subject, perform]);

    const deselect = useCallback(() => {
        if (selectedItemId !== undefined) controller.selectItem(undefined, undefined);
        else controller.select(undefined);
    }, [selectedItemId, controller]);

    return { subject, readOnlyReason: controller.readOnlyReason, renameToken, announcement, notice, pointItem, perform, add, act, rename, deselect, outlets: screenOutlets };
}

const defaultSlots = ['content'];

// The toast goes away by itself after a few seconds.
function useNoticeExpiry(notice: string, setNotice: (notice: string) => void) {
    useEffect(() => {
        if (notice === '') return;
        const timer = setTimeout(() => setNotice(''), 4000);
        return () => clearTimeout(timer);
    }, [notice, setNotice]);
}

// The kind of navigation region a component draws: the topbar and the sidebar of the application shell.
export function regionOf(componentName: string): NavigationRegionKind | undefined {
    const bare = componentName.slice(componentName.lastIndexOf(':') + 1).toLowerCase();
    return bare === 'topbar' ? NavigationRegionKind.Topbar : bare === 'sidebar' ? NavigationRegionKind.Sidebar : undefined;
}

