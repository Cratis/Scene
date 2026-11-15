// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { IconAdapterProvider, SceneElementView, SceneOutletsProvider, SceneThemeProvider } from '@cratis/scene.react';
import '@cratis/scene.primereact/primeReactTheme.css';
import '../Runtime/ProfileThemeRoot.css';
import '../Runtime/PortableComponents.css';
import { LayoutConfigProvider } from '@cratis/scene.blueprint.default';
import type { BindingResolver } from '@cratis/scene.engine';
import { OutletItemKind, type EffectiveConfiguration, type OutletItem } from '@cratis/scene.model';
import { Ownership } from '../Structure/Ownership';
import { profileColorSchemeClasses } from '../Runtime/profileColorScheme';
import { profileTheme } from '../Runtime/profileTheme';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { designTimeRegistry } from './DesignTime/designTimeRegistry';
import type { SurfaceStrings } from './DesignTime/SurfaceStrings';
import { SelectionGrip } from './SelectionGrip';
import { DropIndicator } from './DropIndicator';
import { BindingSourceMarkers } from './BindingSourceMarkers';
import { useSelectedBindingMarkers } from './useSelectedBindingMarkers';
import { useSurfaceDrop } from './useSurfaceDrop';
import { useSurfaceMeasurement } from './useSurfaceMeasurement';
import { useSurfaceMeasurer } from './useSurfaceMeasurer';
import { useDrawnScreen, useEffectiveConfiguration } from './useDrawnScreen';
import { dialogFrameAttributes } from './dialogFrameAttributes';
import './DialogFrame.css';
import { useSurfaceKeys } from './useSurfaceKeys';
import { useSurfaceViewportHeight } from './useSurfaceViewportHeight';
import { dropAnnouncement, selectedNameOf } from './surfaceText';
import { useDesignTimePointer } from './useDesignTimePointer';
import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import { DesignModeChrome } from '../DesignMode/DesignModeChrome';
import { DesignModeFrames } from '../DesignMode/DesignModeFrames';
import { EditorNavigationScope } from '../DesignMode/Navigation/EditorNavigationScope';
import { chainAt } from '../Outlets/screenOutletChain';
import { defaultDesignModeStrings } from '../DesignMode/DesignModeStrings';
import { useDesignMode } from '../DesignMode/useDesignMode';
import { isRejection } from '../DesignMode/designModeTypes';
import { nextElementId } from '../Host/nextElementId';
import type { ShellState } from '../ShellFrame/useShellFrame';
import './ScreenSurface.css';

export interface ScreenSurfaceProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    resolveBinding: BindingResolver;
    configuration?: EffectiveConfiguration;
    strings: SurfaceStrings;

    // The editor's own words, for the choices the design-mode toolbar opens as popovers (the same editors the Properties tab draws) and the toolbar's
    // own words, which are English when the host gives none.
    editorStrings?: ScreenEditorStrings;

    // The height of the screen's viewport, which is what a component that fills the screen fills. Without it the surface uses
    // the height of the space it is drawn in.
    viewportHeight?: number;

    // The application's shell around the screen, when the author has it on; absent, the screen is drawn alone.
    shell?: ShellState;
}

const noBinding: BindingResolver = () => undefined;

// What a new button and a new navigation item are titled until the author types over it (TB1, spec p13-3).
const startingLabels = { button: 'Button', item: 'New item' };

// The editing surface. The screen is drawn by Scene's own renderer - the composition a user would get in Play - and the
// editor adds only what sits around it: a selection outline, and the places something can be dropped, laid out from the
// model's drop regions over whatever the renderer produced. Nothing here is part of the designed screen.
export const ScreenSurface = ({ controller, environment, resolveBinding = noBinding, configuration: given, strings, editorStrings, viewportHeight, shell }: ScreenSurfaceProps) => {
    const surface = useRef<HTMLDivElement>(null);
    const { dropRegions, selectedId } = controller;
    const { selectionRect, measureNow } = useSurfaceMeasurement(surface, dropRegions, selectedId);
    const { feedback, draggedId, startMoving, endMoving, handlers } = useSurfaceDrop(surface, measureNow, controller);
    const bindingMarkers = useSelectedBindingMarkers(controller, environment);

    const configuration = useEffectiveConfiguration(given, controller);

    // Design mode is the chrome of the selected component that declares one, or of the item of it that is selected (DM1).
    const designModeStrings = editorStrings?.designMode ?? defaultDesignModeStrings;
    const firstDestination = environment.destinations[0];
    const startingDestination = useMemo(() => firstDestination ? { screen: firstDestination.id } : undefined, [firstDestination]);
    const designMode = useDesignMode({ controller, environment, strings: designModeStrings, startingLabels, ...(startingDestination ? { startingDestination } : {}) });
    // A screen opened to give a slice a button (StudioIssues#1333) adds it once the outlet is there to add to: the same edit the outlet's own "+" makes, so it is one undo step,
    // and the new button is the one selected.
    const { buttonToAdd, settleButtonToAdd, changeDocument, selectItem } = controller;
    const outlets = designMode.outlets;
    useEffect(() => {
        if (!buttonToAdd || !outlets) return;
        const outlet = outlets.design(buttonToAdd.button.outlet);
        settleButtonToAdd();
        if (!outlet) return;
        const item = { kind: OutletItemKind.Button, id: nextElementId(), title: buttonToAdd.button.title, slice: buttonToAdd.button.slice } as OutletItem;
        const plan = outlet.addItem(item);
        if (isRejection(plan) || !plan.documentChange) return;
        if (changeDocument(plan.documentChange, plan.label).applied) selectItem(buttonToAdd.componentId, item.id);
    }, [buttonToAdd, outlets, settleButtonToAdd, changeDocument, selectItem]);

    // A component that fills the screen (`100vh`) fills the viewport the screen is drawn for, not the browser window around the editor.
    const height = useSurfaceViewportHeight(surface, viewportHeight);

    const removeWithKey = useSurfaceKeys(surface, controller, designMode, shell);

    const movable = !!controller.selectedId && controller.ownershipOf(controller.selectedId) === Ownership.Local && controller.canRemove(controller.selectedId);
    const selectedName = selectedNameOf(controller.selection);

    // A click anywhere on the screen selects the element it is on. It is heard on the way down, so the inner controls of a navigation bar, a menu,
    // a tab view or a toolbar - which stop the event, or act on it - cannot take it from the surface.
    useDesignTimePointer(surface, (id, itemId) => { controller.select(id); designMode.pointItem(id, itemId); }, shell?.frame !== undefined);

    // What is added to a canvas without a drop point is placed below what is already there, in the sizes drawn here.
    useSurfaceMeasurer(surface, controller.setMeasurer);

    const drawn = useDrawnScreen(controller, environment, shell, editorStrings);
    const peeking = shell?.peeking;

    const registry = useMemo(() => designTimeRegistry(environment.runtime.registry, strings), [environment.runtime.registry, strings]);

    // The profile's theme, exactly as Play applies it: the theme root carries the theme's tokens and, through the bridge stylesheet, feeds
    // them to PrimeReact, and it paints the screen's own background. The surface paints nothing of its own.
    const theme = useMemo(() => profileTheme(environment.runtime), [environment.runtime]);

    // The outlets the screen's template declares draw what Scene resolves for the level being edited - its defaults, and what the levels above extend,
    // override, hide and contribute (StudioIssues#1330) - as Stage and the preview draw them.
    const screenOutlets = designMode.outlets;
    const outletsValue = useMemo(() => {
        if (!screenOutlets) return undefined;
        const scoped = chainAt(screenOutlets.outlets, screenOutlets.level);
        return scoped.chain.length > 0 ? { chain: scoped.chain, contributors: scoped.contributors } : undefined;
    }, [screenOutlets]);

    const rendered = useMemo(
        () => (
            <IconAdapterProvider registry={environment.runtime.iconAdapters}>
                {/* A shell part on its own - a topbar, a sidebar, a mask - reads the shell's configuration, which the application shell would provide. */}
                <LayoutConfigProvider storage={null}>
                    {/* The application's navigation, for the regions on the screen: the level being edited decides what each shows (spec 5). */}
                    <EditorNavigationScope structure={controller.structure} navigation={controller.navigation} module={controller.navigationModule} logoLockedReason={designModeStrings.navigation.logoLocked} onNavigate={shell?.frame ? shell.navigate : undefined} peeking={peeking ? shell?.peekingName : undefined}>
                        {outletsValue
                            ? <SceneOutletsProvider value={outletsValue}><SceneElementView element={drawn} registry={registry} resolveBinding={resolveBinding} configuration={configuration} /></SceneOutletsProvider>
                            : <SceneElementView element={drawn} registry={registry} resolveBinding={resolveBinding} configuration={configuration} />}
                    </EditorNavigationScope>
                </LayoutConfigProvider>
            </IconAdapterProvider>
        ),
        [drawn, registry, environment.runtime.iconAdapters, resolveBinding, configuration, controller.structure, controller.navigation, controller.navigationModule, shell?.frame, shell?.navigate, shell?.peekingName, peeking, outletsValue]);

    // A screen that opens as a popup is drawn as that popup, on a neutral backdrop: the backdrop is the surface itself.
    const popup = dialogFrameAttributes(shell?.dialog);
    const style = {
        ...popup.style,
        ...(height === undefined ? {} : { '--studio-surface-viewport-height': `${height}px` }),
        '--studio-empty-container-label': JSON.stringify(strings.emptyContainer),
    } as CSSProperties;

    return (
        <SceneThemeProvider theme={theme} className={`studio-profile-theme studio-screen-surface-theme ${profileColorSchemeClasses(theme)}`}>
        <div ref={surface} className='studio-screen-surface' style={style} data-studio-dialog={popup['data-studio-dialog']} data-studio-dragging={feedback ? 'true' : undefined} onKeyDown={removeWithKey} tabIndex={-1} {...handlers}>
            {rendered}
            <div className='studio-screen-surface__chrome'>
                {selectionRect && <div className='studio-screen-surface__selection' data-moving={draggedId === controller.selectedId ? 'true' : undefined} style={selectionRect} />}
                {selectionRect && movable && <SelectionGrip left={selectionRect.left} top={selectionRect.top} elementId={controller.selectedId!} name={selectedName} title={strings.moveHandle(selectedName)} onStart={startMoving} onEnd={endMoving} />}
                                {feedback && <DropIndicator feedback={feedback} deniedText={strings.dropDenied} />}
                <BindingSourceMarkers surface={surface} markers={bindingMarkers} />
                <DesignModeFrames surface={surface} controller={controller} strings={designModeStrings} {...(designMode.outlets ? { outlets: designMode.outlets } : {})} />
                {editorStrings && <DesignModeChrome surface={surface} state={designMode} controller={controller} environment={environment} editorStrings={editorStrings} strings={designModeStrings} />}
                {/* The grip is for the pointer; the keyboard moves an element with Alt and the arrows in Structure, and adds one with Enter on a palette tile. A
                    person who cannot see the markers is told where a drag would land. */}
                <span className='studio-screen-surface__announcement' role='status' aria-live='polite'>{dropAnnouncement(feedback, strings)}</span>
            </div>
        </div>
        </SceneThemeProvider>
    );
};
