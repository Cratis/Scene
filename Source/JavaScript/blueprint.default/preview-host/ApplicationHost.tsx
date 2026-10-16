// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, useMemo, useState } from 'react';
import { DialogTemplate, SceneElement, type EffectiveConfiguration } from '@cratis/scene.model';
import { BindingResolver, BindingScope } from '@cratis/scene.engine';
import {
    ComponentRegistry, NavigationActivationPolicy, NavigationActivationProvider, SceneElementView, SceneHistory, SceneNavigationContextValue, SceneNavigationModel, SceneNavigationModelProvider,
    SceneNavigationProvider, SceneOutletContext, SliceDialogView, collectOutletOwners, createMemorySceneHistory, shellOutletOwner, navigationDestinations,
    sceneRoutesFrom, sliceDialogParameters, useSceneHistoryNavigation,
} from '@cratis/scene.react';
import { LayoutConfigProvider } from '../configuration';
import { ApplicationDocument } from './ApplicationDocument';
import { previewComponents } from './PreviewTemplate';
import { CompositionOptions, collectDestinations, composeApplicationScreen, composeDialog, composeOutletScreen, effectiveShellOf } from './composeApplication';

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

    /**
     * How the navigating controls of the shell - menu entries, region items, crumbs, the logo, user-menu entries - are handled:
     * `mode: 'select'` makes a click only report the activation (a design host selects the item), Alt-click does so in any mode,
     * and `onActivate`/`onNavigate` are told of each. Absent, a click navigates (spec N1, N2).
     */
    navigationPolicy?: NavigationActivationPolicy;

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

    /**
     * Draws a dialog the document declares, in place of the host's plain one - a host that wants its own backdrop, a close button
     * and keyboard handling around the template's content. Called inside {@link scope}.
     * @param template The dialog template that is open.
     * @param content The template's composed content.
     * @param navigation Where the user is.
     */
    renderDialogTemplate?(template: DialogTemplate, content: SceneElement, navigation: SceneNavigationContextValue): ReactNode;

    /**
     * What a host provides around everything that renders - the screen on the page and the dialog over it: its data, its command
     * dispatcher, its chrome state. Inside the navigation providers, so it can read where the user is. Stage puts its data and
     * interaction scope here, so the screen, a dialog template and a slice dialog all share them.
     * @param navigation Where the user is.
     * @param children The screen and the dialog.
     */
    scope?(navigation: SceneNavigationContextValue, children: ReactNode): ReactNode;

    /**
     * Where the shell keeps its layout configuration - the sidebar's state, the chosen theme. A preview keeps none (null, the default);
     * a running application passes its storage so what a user chose is still chosen on the next visit.
     */
    layoutConfigStorage?: Storage | null;

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
export function ApplicationHost({ application, composition = {}, navigationModel, registry: hostRegistry, initialScreen, history, navigationPolicy, resolveBinding, queryResults, renderScreen, renderDialog, renderDialogTemplate, scope, layoutConfigStorage = null, children }: ApplicationHostProps) {
    const [memoryHistory] = useState(() => createMemorySceneHistory());
    const registry = useMemo(() => ({ ...previewComponents, ...hostRegistry }), [hostRegistry]);
    const hostHistory = history ?? memoryHistory;
    const screens = application.screens;

    const outletScreens = useMemo(
        () => Object.fromEntries(screens.map(candidate => [candidate.name, composeOutletScreen(application, candidate, composition)])),
        [application, composition, screens]);
    const destinations = useMemo(
        () => [...collectDestinations(application), ...navigationDestinations(navigationModel.structure, navigationModel.navigation, navigationModel.screenFor)],
        [application, navigationModel]);
    const screenOwners = useMemo(() => collectOutletOwners(outletScreens), [outletScreens]);

    // An outlet a destination renders into that no screen declares but the shell does - `slot side` - is the shell's: it holds the screen beside
    // the primary one, so the shell is given a closable outlet in that slot and the owner of the outlet is the shell.
    const shellOutlets = useMemo(() => {
        const wanted = new Set(destinations.flatMap(destination => destination.outlet && !(destination.outlet in screenOwners) ? [destination.outlet] : []));
        if (wanted.size === 0) return [];
        return [...new Set(screens.flatMap(candidate => {
            const shell = effectiveShellOf(application, candidate, composition);
            return shell.outlets.filter(name => name !== shell.primaryOutlet && wanted.has(name));
        }))];
    }, [application, composition, destinations, screenOwners, screens]);
    const owners = useMemo(() => ({ ...screenOwners, ...Object.fromEntries(shellOutlets.map(name => [name, shellOutletOwner])) }), [screenOwners, shellOutlets]);
    const hostedComposition = useMemo<CompositionOptions>(() => shellOutlets.length === 0 ? composition : { ...composition, hostedOutlets: [...(composition.hostedOutlets ?? []), ...shellOutlets] }, [composition, shellOutlets]);
    const routes = useMemo(() => sceneRoutesFrom(screens.map(candidate => candidate.name), destinations), [destinations, screens]);
    const bindingScope = useMemo<BindingScope>(() => ({ queryResults }), [queryResults]);
    const navigation = useSceneHistoryNavigation(hostHistory, routes, initialScreen, bindingScope, owners, destinations);

    const screen = screens.find(candidate => candidate.name === navigation.primaryScreen) ?? screens.find(candidate => candidate.name === initialScreen) ?? screens[0];
    const composed = useMemo(() => screen ? composeApplicationScreen(application, screen, hostedComposition) : undefined, [application, hostedComposition, screen]);
    const outletContext = useMemo(() => ({ screens: outletScreens, registry }), [outletScreens, registry]);

    const dialogTemplate = navigation.currentDialog ? application.dialogTemplates?.find(candidate => candidate.name === navigation.currentDialog) : undefined;
    const sliceDialog = !dialogTemplate && navigation.currentDialog && sliceDialogParameters(navigation.currentDialogParameters) !== undefined;
    const dialogName = sliceDialogParameters(navigation.currentDialogParameters)?.title ?? navigation.currentDialog;

    const dialogContent = dialogTemplate ? composeDialog(application, dialogTemplate, composition) : undefined;

    const body = (
        <>
            <div data-scene-outlet='primary' data-scene-url={navigation.currentUrl} data-scene-screen={navigation.primaryScreen}>
                {composed && <Drawn>{renderScreen
                    ? () => renderScreen(composed.element, composed.configuration, navigation)
                    : () => <SceneElementView element={composed.element} registry={registry} resolveBinding={resolveBinding} queryResults={queryResults} configuration={composed.configuration} />}</Drawn>}
            </div>
            {dialogTemplate && dialogContent && (renderDialogTemplate
                ? <Drawn>{() => renderDialogTemplate(dialogTemplate, dialogContent, navigation)}</Drawn>
                : (
                    <div role='dialog' aria-modal='true' aria-label={dialogName} data-scene-dialog={navigation.currentDialog}>
                        <SceneElementView element={dialogContent} registry={registry} resolveBinding={resolveBinding} queryResults={queryResults} />
                    </div>
                ))}
            {sliceDialog && (
                <div role='dialog' aria-modal='true' aria-label={dialogName} data-scene-dialog={navigation.currentDialog}>
                    {renderDialog?.(navigation) ?? <SliceDialogView />}
                </div>
            )}
        </>
    );

    return (
        <SceneNavigationProvider value={navigation}>
            <SceneOutletContext.Provider value={outletContext}>
                <SceneNavigationModelProvider model={navigationModel}>
                    {/* The shell reads its layout configuration from a provider; nothing is saved unless the host gives it somewhere to. */}
                    <LayoutConfigProvider storage={layoutConfigStorage}>
                        <NavigationActivationProvider {...navigationPolicy}>
                            {scope ? scope(navigation, body) : body}
                            {children}
                        </NavigationActivationProvider>
                    </LayoutConfigProvider>
                </SceneNavigationModelProvider>
            </SceneOutletContext.Provider>
        </SceneNavigationProvider>
    );
}

/** Calls what a host draws as part of this component, so a hook it uses runs under the providers the host put in scope. */
function Drawn({ children }: { children(): ReactNode }) {
    return <>{children()}</>;
}
