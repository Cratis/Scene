// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutThemeProvider, ScenePreviewHost, listDestinations } from '@cratis/scene.blueprint.default';
import { LayoutConfigProvider } from '@cratis/scene.blueprint.default';
import type { DestinationReference, SampleDataPack, ScreenTemplate } from '@cratis/scene.model';
import type { NavigationActivation, NavigationMode, ScenePackageBundle } from '@cratis/scene.react';
import '@cratis/scene.blueprint.default/styles.css';
import '@cratis/scene.primereact/primeReactTheme.css';
import '@cratis/scene.components/styles';
import '../../BlueprintPreview/BlueprintScreenStage.css';
import { blueprintPreviewRegistry } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { PreviewConfigSync } from '../../UiProfile/PreviewConfigSync';
import { applyAccent } from '../../UiProfile/applyAccent';
import type { ResolvedUiProfile } from '../../UiProfile/ResolvedUiProfile';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import type { ViewportSize } from '../../ScreenEditor/Viewport/ViewportSize';
import { destinationLabel } from '../Navigation/destinationLabel';
import { findDeadTargets, type DeadTarget } from '../Navigation/findDeadTargets';
import { NavigationBridge, type CanvasNavigation } from '../Navigation/NavigationBridge';
import { NavigationKeyAction, navigationKeyAction } from '../Navigation/navigationKey';
import { PeekBar } from '../Navigation/PeekBar';
import { isPeeking, moved, type PeekState } from '../Navigation/peekOf';
import { previewApplicationOf } from '../Navigation/previewApplicationOf';
import { ShowingPicker } from '../Navigation/ShowingPicker';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

export interface ProfileCanvasProps {
    settings: UiProfileSettings;
    resolved: ResolvedUiProfile;
    bundles: ScenePackageBundle[];
    strings: UiProfileDesignerStrings;
    size: ViewportSize;

    // Preview behaves as the application does; design mode also selects the navigation item that was clicked.
    previewing: boolean;

    // Leaves the preview (Escape).
    onExitPreview(): void;

    // The navigation entry the author selected on the canvas, with whether its target resolves.
    onSelectItem?(item: { id: string; label: string; resolves: boolean }): void;

    // Reports the entries drawn as dead, as problems of the shell (spec N8).
    onDeadTargets?(dead: DeadTarget[]): void;

    // The number of problems the profile has, for the chip.
    problemCount: number;

    // Opens a peeked destination where it is edited; absent where there is no editor for it.
    onOpenInEditor?(destination: DestinationReference): void;

    // The sample data the canvas is drawn with: the packs there are and the one chosen ('' is the generated data).
    packs?: SampleDataPack[];
    samplePack?: string;

    // The application's own templates as Scene reads them, with what each declares: an own shell is drawn from its document.
    ownTemplates?: readonly ScreenTemplate[];
}

const noStructure = { modules: [] };

// The application as the profile makes it, running in Scene's own preview host: the shell, its navigation, and the pages it leads to. A
// click on a navigation entry navigates in the host's memory history - the page's address is never touched (spec N1) - and in design mode
// it also selects the entry and shows the destination as a read-only peek (N2). *Showing* is the other way to go somewhere (N3).
export const ProfileCanvas = ({ settings, resolved, bundles, strings, size, previewing, onExitPreview, onSelectItem, onDeadTargets, problemCount, onOpenInEditor, packs = [], samplePack = '', ownTemplates }: ProfileCanvasProps) => {
    const application = useMemo(() => previewApplicationOf(resolved, bundles, ownTemplates), [resolved, bundles, ownTemplates]);
    const listing = useMemo(() => listDestinations(application.document), [application.document]);
    const listed = useMemo(() => listing.flatMap(group => group.destinations), [listing]);
    const themes = useMemo(() => applyAccent(resolved.compatibleThemes, settings.accent), [resolved, settings.accent]);
    const text = strings.navigation;

    const [start] = useState<DestinationReference | undefined>(() => listing[0]?.destinations[0]?.destination);
    const [peek, setPeek] = useState<PeekState>({ base: start, current: start });
    const [selected, setSelected] = useState<{ id: string; label: string; resolves: boolean }>();
    const [navigateOnClick] = useState(true);
    const navigation = useRef<CanvasNavigation | undefined>(undefined);
    const chosen = useRef(false);
    const frame = useRef<HTMLDivElement>(null);

    const peeking = !previewing && isPeeking(peek);
    const mode = useCallback((): NavigationMode => navigateOnClick ? 'navigate' : 'select', [navigateOnClick]);

    const activated = useCallback((activation: NavigationActivation) => {
        if (previewing) return;
        const item = { id: activation.request.id ?? '', label: activation.request.label ?? '', resolves: activation.resolves };
        setSelected(item);
        onSelectItem?.(item);
    }, [previewing, onSelectItem]);

    const navigated = useCallback((destination: DestinationReference) => {
        setPeek(state => moved(state, destination, chosen.current));
        chosen.current = false;
    }, []);

    const showing = useCallback((destination: DestinationReference) => {
        chosen.current = true;
        navigation.current?.navigate(destination);
    }, []);

    const back = useCallback(() => {
        if (peek.base) showing(peek.base);
    }, [peek.base, showing]);

    const openInEditor = useCallback(() => {
        if (peek.current) onOpenInEditor?.(peek.current);
    }, [peek.current, onOpenInEditor]);

    useEffect(() => {
        const keyDown = (event: KeyboardEvent) => {
            const action = navigationKeyAction(event.key, { previewing, peeking, onPeekBar: (event.target as HTMLElement | null)?.closest?.('.studio-uiprofile-peek') != null }, event.shiftKey);
            if (action === NavigationKeyAction.LeavePeek) {
                event.preventDefault();
                back();
            } else if (action === NavigationKeyAction.OpenInEditor && onOpenInEditor) {
                event.preventDefault();
                openInEditor();
            }
        };
        window.addEventListener('keydown', keyDown);
        return () => window.removeEventListener('keydown', keyDown);
    }, [previewing, peeking, back, openInEditor, onOpenInEditor]);

    // The selected entry is outlined where it is drawn; the host owns the markup, so this only marks it.
    useEffect(() => {
        const root = frame.current;
        if (!root) return undefined;
        root.querySelectorAll('[data-design-selected]').forEach(element => element.removeAttribute('data-design-selected'));
        if (previewing || !selected?.id) return undefined;
        root.querySelector(`[data-scene-id="${CSS.escape(selected.id)}"]`)?.setAttribute('data-design-selected', 'true');
        return undefined;
    });

    // Dead entries are read from what the host drew, whenever it draws something else.
    const reported = useRef('');
    useEffect(() => {
        const root = frame.current;
        if (!root || !onDeadTargets) return undefined;
        const report = () => {
            const dead = findDeadTargets(root);
            const key = JSON.stringify(dead);
            if (key === reported.current) return;
            reported.current = key;
            onDeadTargets(dead);
        };
        report();
        const observer = new MutationObserver(report);
        observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-nav-problem'] });
        return () => observer.disconnect();
    }, [onDeadTargets]);

    const ready = useCallback((value: CanvasNavigation) => { navigation.current = value; }, []);
    const mobile = size.width <= 480;
    const currentName = destinationLabel(peek.current, listed);

    return (
        <LayoutConfigProvider storage={null} viewportWidth={size.width}>
            <PreviewConfigSync settings={settings} />
            <div className='studio-uiprofile-canvas' data-mode={previewing ? 'preview' : 'design'}>
                {peeking && <PeekBar name={currentName} strings={text} onBack={back} onOpenInEditor={onOpenInEditor ? openInEditor : undefined} />}
                <div ref={frame} className='studio-uiprofile-designer__frame studio-uiprofile-canvas__frame studio-blueprint-stage' data-sample-pack={samplePack} data-device={mobile ? 'mobile' : 'desktop'} style={{ width: Math.min(size.width, 4000) }}>
                    <LayoutThemeProvider themes={themes} className='studio-blueprint-stage__theme'>
                        <ScenePreviewHost
                            document={application.document}
                            composition={application.composition}
                            structure={noStructure}
                            target={{ application: true }}
                            initialDestination={start}
                            navigationMode={mode}
                            sampleData={{ packs, sessionActivePack: samplePack || undefined }}
                            onActivate={activated}
                            onNavigate={navigated}
                            registry={blueprintPreviewRegistry}
                            onExit={previewing ? onExitPreview : undefined}>
                            <NavigationBridge onReady={ready} />
                        </ScenePreviewHost>
                    </LayoutThemeProvider>
                </div>
                <div className='studio-uiprofile-canvas__footer'>
                    <ShowingPicker listing={listing} current={peek.current} label={text.showing} groupLabels={text.groups} onPick={showing} />
                    {!previewing && selected && !selected.resolves && <span className='studio-uiprofile-canvas__hint' role='status'>{text.noTarget.replace('{name}', selected.label)}</span>}
                    {problemCount > 0 && <span className='studio-uiprofile-canvas__problems'>{text.problems.replace('{count}', String(problemCount))}</span>}
                </div>
            </div>
        </LayoutConfigProvider>
    );
};
