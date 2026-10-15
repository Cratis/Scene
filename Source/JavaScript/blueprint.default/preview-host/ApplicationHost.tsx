// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, useMemo, useState } from 'react';
import { SceneElement, type EffectiveConfiguration } from '@cratis/scene.model';
import { BindingResolver, BindingScope } from '@cratis/scene.engine';
import {
    ComponentRegistry, SceneElementView, SceneHistory, SceneNavigationContextValue, SceneNavigationModel, SceneNavigationModelProvider,
    SceneNavigationProvider, SceneOutletContext, SliceDialogView, collectOutletOwners, createMemorySceneHistory, navigationDestinations,
    sceneRoutesFrom, sliceDialogParameters, useSceneHistoryNavigation,
} from '@cratis/scene.react';
import { LayoutConfigProvider } from '../configuration';
import { ApplicationDocument } from './ApplicationDocument';
import { previewComponents } from './PreviewTemplate';
import { CompositionOptions, collectDestinations, composeApplicationScreen, composeDialog, composeOutletScreen } from './composeApplication';

export interface ApplicationHostProps {
    /** The document the application is composed from. */
    application: ApplicationDocument;

    /** What the host decides about composition; Stage and the preview host differ only here. */
    composition?: CompositionOptions;

    /** The structure and navigation the shell's regions show and the items' destinations resolve against. */
    navigationModel: SceneNavigationModel;

    registry: ComponentRegistry;

    /** The screen shown first. */
    initialScreen: string;

    /** Where entries are recorded: the address bar for Stage, an in-memory history for a preview, which never touches the host's URL (PRV4). */
    history?: SceneHistory;

    /** What the screens' bindings resolve against. */
    resolveBinding?: BindingResolver;
    queryResults?: Record<string, unknown>;

    /**
     * Draws the composed screen. The default renders it with `SceneElementView`; Stage wraps it with its data and command scope.
     * @param element The composed screen.
     * @param configuration What the screen's templates were configured with.
     * @param navigation Where the user is.
     */
    renderScreen?(element: SceneElement, configuration: EffectiveConfiguration | undefined, navigation: SceneNavigationContextValue): ReactNode;

    /**
     * Draws what the open dialog shows when the document has no dialog template of that name - a toolbar slice button's task
     * dialog by default.
     */
    renderDialog?(navigation: SceneNavigationContextValue): ReactNode;

    /** Rendered inside the host's providers, after the application. */
    children?: ReactNode;
}

/**
 * The application as both Stage and the preview host run it: the shell composed for the screen on the page
 * (`composeApplicationScreen`), nested outlets holding the screens placed in them, the navigation model in scope for the shell's
 * topbar and sidebar regions, every destination the document and the navigation lead to routed, and the dialog a toolbar slice
 * button or a dialog destination opened shown over it - one place for all of it (spec PRV9), so a behaviour that differs between
 * the two hosts is a bug in the host, not a second implementation.
 */
export function ApplicationHost({ application, composition = {}, navigationModel, registry: hostRegistry, initialScreen, history, resolveBinding, queryResults, renderScreen, renderDialog, children }: ApplicationHostProps) {
    const [memoryHistory] = useState(() => createMemorySceneHistory());
    const registry = useMemo(() => ({ ...previewComponents, ...hostRegistry }), [hostRegistry]);
    const hostHistory = history ?? memoryHistory;
    const screens = application.screens;

    const outletScreens = useMemo(
        () => Object.fromEntries(screens.map(candidate => [candidate.name, composeOutletScreen(application, candidate, composition)])),
        [application, composition, screens]);
    const owners = useMemo(() => collectOutletOwners(outletScreens), [outletScreens]);
    const destinations = useMemo(
        () => [...collectDestinations(application), ...navigationDestinations(navigationModel.structure, navigationModel.navigation, navigationModel.screenFor)],
        [application, navigationModel]);
    const routes = useMemo(() => sceneRoutesFrom(screens.map(candidate => candidate.name), destinations), [destinations, screens]);
    const bindingScope = useMemo<BindingScope>(() => ({ queryResults }), [queryResults]);
    const navigation = useSceneHistoryNavigation(hostHistory, routes, initialScreen, bindingScope, owners, destinations);

    const screen = screens.find(candidate => candidate.name === navigation.primaryScreen) ?? screens.find(candidate => candidate.name === initialScreen) ?? screens[0];
    const composed = useMemo(() => screen ? composeApplicationScreen(application, screen, composition) : undefined, [application, composition, screen]);
    const outletContext = useMemo(() => ({ screens: outletScreens, registry }), [outletScreens, registry]);

    const dialogTemplate = navigation.currentDialog ? application.dialogTemplates?.find(candidate => candidate.name === navigation.currentDialog) : undefined;
    const sliceDialog = !dialogTemplate && navigation.currentDialog && sliceDialogParameters(navigation.currentDialogParameters) !== undefined;
    const dialogName = sliceDialogParameters(navigation.currentDialogParameters)?.title ?? navigation.currentDialog;

    const drawn = composed
        ? renderScreen?.(composed.element, composed.configuration, navigation)
            ?? <SceneElementView element={composed.element} registry={registry} resolveBinding={resolveBinding} queryResults={queryResults} configuration={composed.configuration} />
        : null;

    return (
        <SceneNavigationProvider value={navigation}>
            <SceneOutletContext.Provider value={outletContext}>
                <SceneNavigationModelProvider model={navigationModel}>
                    {/* The shell reads its layout configuration from a provider; nothing is saved from a hosted application's own. */}
                    <LayoutConfigProvider storage={null}>
                        <div data-scene-outlet='primary' data-scene-url={navigation.currentUrl} data-scene-screen={navigation.primaryScreen}>{drawn}</div>
                        {(dialogTemplate || sliceDialog) && (
                            <div role='dialog' aria-modal='true' aria-label={dialogName} data-scene-dialog={navigation.currentDialog}>
                                {dialogTemplate
                                    ? <SceneElementView element={composeDialog(application, dialogTemplate, composition)} registry={registry} resolveBinding={resolveBinding} queryResults={queryResults} />
                                    : renderDialog?.(navigation) ?? <SliceDialogView />}
                            </div>
                        )}
                        {children}
                    </LayoutConfigProvider>
                </SceneNavigationModelProvider>
            </SceneOutletContext.Provider>
        </SceneNavigationProvider>
    );
}
