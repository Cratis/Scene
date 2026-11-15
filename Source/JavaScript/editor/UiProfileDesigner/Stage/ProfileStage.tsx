// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LayoutConfigProvider, LayoutThemeProvider, ScenePreviewHost, listDestinations, type PreviewRegionHandle } from '@cratis/scene.blueprint.default';
import { describeRegions, normalizeNavigationMode, NavigationMode, ProfileRegion } from '@cratis/scene.engine';
import type { DestinationReference, SampleDataPack, ScreenTemplate } from '@cratis/scene.model';
import type { NavigationMode as ClickMode, ScenePackageBundle } from '@cratis/scene.react';
import '@cratis/scene.blueprint.default/styles.css';
import '@cratis/scene.primereact/primeReactTheme.css';
import '@cratis/scene.components/styles';
import '../../BlueprintPreview/BlueprintScreenStage.css';
import { blueprintPreviewRegistry } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { applyAccent } from '../../UiProfile/applyAccent';
import { PreviewConfigSync } from '../../UiProfile/PreviewConfigSync';
import { previewProfileOf } from '../../UiProfile/resolveUiProfile';
import type { ResolvedUiProfile } from '../../UiProfile/ResolvedUiProfile';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import { NavigationBridge, type CanvasNavigation } from '../Navigation/NavigationBridge';
import { previewApplicationOf } from '../Navigation/previewApplicationOf';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { fitToStage, regionOnStage, type StageFit } from './stageScale';

export interface ProfileStageProps {
    settings: UiProfileSettings;

    /** The application's name, which the identity falls back to when the profile chose none. */
    applicationName: string;
    resolved: ResolvedUiProfile;
    bundles: ScenePackageBundle[];
    strings: UiProfileDesignerStrings;

    /** The preview's own size - 1280 by 720 for the desktop, 390 by 844 for a phone. */
    size: { width: number; height: number };

    /** Whether the preview is a touch size class; the menu is then a drawer. */
    touch: boolean;

    packs?: SampleDataPack[];
    samplePack?: string;

    /** The application's own templates as Scene reads them, so an own shell is drawn from its document. */
    ownTemplates?: readonly ScreenTemplate[];

    /** The region the inspector is showing, which the preview outlines so the two are seen to be one thing. */
    activeRegion?: ProfileRegion;

    /** Called with the region a click chose; the designer scrolls the inspector to the section that edits it. */
    onSelectRegion?(region: ProfileRegion): void;

    /** Called with the region under the pointer, and with `null` when it leaves them all. */
    onHoverRegion?(region: ProfileRegion | null): void;

    /** Called whenever the preview is laid out again, with the scale it is shown at, for the size readout. */
    onFit?(fit: StageFit): void;
}

const noStructure = { modules: [] };

/**
 * The preview stage: the application as the profile resolves it, shown at the chosen size and scaled to fit. The preview is the navigation of the
 * inspector - hovering a region outlines it and says what it is, clicking one selects it - and every region, every box and every rule about which
 * is drawn comes from Scene.
 */
export const ProfileStage = ({ settings, applicationName, resolved, bundles, strings, size, touch, packs = [], samplePack = '', ownTemplates = [], activeRegion, onSelectRegion, onHoverRegion, onFit }: ProfileStageProps) => {
    const application = useMemo(() => previewApplicationOf({ ...resolved, profile: previewProfileOf(resolved, settings) }, bundles, ownTemplates, applicationName), [resolved, settings, bundles, ownTemplates, applicationName]);
    const listing = useMemo(() => listDestinations(application.document), [application.document]);
    const themes = useMemo(() => applyAccent(resolved.compatibleThemes, settings.accent), [resolved, settings.accent]);
    const [start] = useState<DestinationReference | undefined>(() => listing[0]?.destinations[0]?.destination);
    const navigation = useRef<CanvasNavigation | undefined>(undefined);
    const handle = useRef<PreviewRegionHandle>(null);
    const room = useRef<HTMLDivElement>(null);
    const [fit, setFit] = useState<StageFit>({ scale: 1, width: size.width, height: size.height });
    const [hovered, setHovered] = useState<ProfileRegion | null>(null);
    const [box, setBox] = useState<{ left: number; top: number; width: number; height: number } | undefined>();
    const mode = normalizeNavigationMode(settings.navigationMode) ?? NavigationMode.Static;
    const regions = useMemo(() => describeRegions(mode, touch, false), [mode, touch]);
    const text = strings.editor.regions;
    const outlined = hovered ?? activeRegion ?? null;

    // The preview keeps its own width and is scaled to fit the room: measured again when the room or the preview changes.
    useLayoutEffect(() => {
        const element = room.current;
        if (element === null) return undefined;
        const measure = () => {
            const next = fitToStage(size, { width: element.clientWidth, height: element.clientHeight });
            setFit(previous => (previous.scale === next.scale && previous.width === next.width && previous.height === next.height ? previous : next));
        };
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [size.width, size.height]);

    useEffect(() => { onFit?.(fit); }, [fit, onFit]);

    // The outline follows the region as it is drawn now - a menu mode that moves it, a scale that changes it - because Scene measures it, not this.
    useLayoutEffect(() => {
        const frame = requestAnimationFrame(() => {
            const rect = outlined === null ? undefined : handle.current?.regionRect(outlined);
            const next = rect === undefined ? undefined : regionOnStage(rect, fit);
            setBox(previous => (previous?.left === next?.left && previous?.top === next?.top && previous?.width === next?.width && previous?.height === next?.height ? previous : next));
        });
        return () => cancelAnimationFrame(frame);
    });

    const hover = useCallback((region: ProfileRegion | null) => { setHovered(region); onHoverRegion?.(region); }, [onHoverRegion]);
    // A click on a menu entry still navigates the preview (N1) and also reports the menu region (N9), so the author can see the application as it is used.
    const click = useCallback((): ClickMode => 'navigate', []);
    const ready = useCallback((value: CanvasNavigation) => { navigation.current = value; }, []);
    const label = outlined === null ? undefined : regions.find(region => region.id === outlined)?.label ?? text[outlined];

    return (
        <div className='studio-stage' ref={room}>
            <div className='studio-stage__frame' data-device={touch ? 'mobile' : 'desktop'} style={{ width: fit.width, height: fit.height }}>
                <div className='studio-stage__scaled' style={{ width: size.width, height: size.height, transform: `scale(${fit.scale})` }} data-sample-pack={samplePack}>
                    <LayoutConfigProvider storage={null} viewportWidth={size.width}>
                    <PreviewConfigSync settings={settings} />
                    <LayoutThemeProvider themes={themes} className='studio-blueprint-stage__theme'>
                        <ScenePreviewHost
                            document={application.document}
                            composition={application.composition}
                            structure={noStructure}
                            target={{ application: true }}
                            initialDestination={start}
                            navigationMode={click}
                            sampleData={{ packs, sessionActivePack: samplePack || undefined }}
                            viewportWidth={size.width}
                            registry={blueprintPreviewRegistry}
                            regions={handle}
                            onRegionHover={hover}
                            onRegionActivate={onSelectRegion}>
                            <NavigationBridge onReady={ready} />
                        </ScenePreviewHost>
                    </LayoutThemeProvider>
                    </LayoutConfigProvider>
                </div>
                {box !== undefined && label !== undefined && (
                    <div className='studio-stage__outline' data-active={hovered === null || undefined} style={box} aria-hidden='true'>
                        <span className='studio-stage__tag'>{label}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
