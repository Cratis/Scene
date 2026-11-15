// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useRef, useState } from 'react';
import { TemplatePreviewState } from '@cratis/scene.blueprint.default';
import { IconAdapterProvider, SceneElementView, SceneThemeProvider, type ComponentRegistry, type IconAdapterRegistry, type ScenePackageBundle } from '@cratis/scene.react';
import '@cratis/scene.primereact/primeReactTheme.css';
import '../ScreenEditor/Runtime/ProfileThemeRoot.css';
import '../ScreenEditor/Runtime/PortableComponents.css';
import { LayoutConfigProvider } from '@cratis/scene.blueprint.default';
import { profileColorSchemeClasses } from '../ScreenEditor/Runtime/profileColorScheme';
import { profileTheme } from '../ScreenEditor/Runtime/profileTheme';
import type { UiProfile } from '@cratis/scene.model';
import { ErrorBoundary } from '@cratis/components/Common';
import { previewScreensOf, previewOfScreen, previewOfOwnTemplate } from './previewScreens';
import { TemplatePreviewSize } from '../ScreenEditor/Templates/TemplatePreviewSize';
import { formatTemplateBrowserMessage } from './formatTemplateBrowserMessage';
import type { TemplateBrowserEntry } from './TemplateBrowserEntry';
import type { TemplateBrowserStrings } from './TemplateBrowserStrings';
import { templatePreviewGeometry } from './templatePreviewGeometry';
import './TemplateBrowserPreview.css';

/** What a preview is drawn with: the packages, the profile the template will run under, and the components that result. */
export interface TemplateBrowserRuntime {
    bundles: ScenePackageBundle[];
    profile: UiProfile;
    registry: ComponentRegistry;

    /** Draws the icons of the profile's icon libraries. */
    iconAdapters: IconAdapterRegistry;

    /** The saved Scene documents of the application's own templates, by template identifier (lower case): what an own template is drawn from. */
    ownDocuments?: ReadonlyMap<string, string>;
}

export interface TemplateBrowserPreviewProps {
    entry: TemplateBrowserEntry;
    runtime: TemplateBrowserRuntime;
    strings: TemplateBrowserStrings;
}

// The three lights of a browser window's title bar, as the board's miniature of a screen draws them.
const trafficLights = ['#f66', '#fa0', '#3c3'] as const;

/**
 * The template, drawn by the renderer Stage ships, under the profile it will run in: the first screen a package composes from it, in the state and the
 * width chosen. A template nothing composes a screen from - an own template, a shell - says so rather than drawing a guess.
 */
export function TemplateBrowserPreview({ entry, runtime, strings }: TemplateBrowserPreviewProps) {
    const frameRef = useRef<HTMLDivElement>(null);
    const [frameWidth, setFrameWidth] = useState(0);
    const [state, setState] = useState(TemplatePreviewState.Populated);
    const [size, setSize] = useState(TemplatePreviewSize.Desktop);
    const [screenName, setScreenName] = useState<string | undefined>();
    const screens = useMemo(() => previewScreensOf(entry, runtime.bundles), [entry, runtime.bundles]);
    const screen = screens.find(candidate => candidate.name === screenName) ?? screens[0];
    const theme = useMemo(() => profileTheme(runtime), [runtime]);
    const element = useMemo(
        () => screen === undefined ? previewOfOwnTemplate(entry, runtime.ownDocuments, state, runtime.bundles, runtime.profile) : previewOfScreen(screen, state, runtime.bundles, runtime.profile),
        [entry, screen, state, runtime.ownDocuments, runtime.bundles, runtime.profile]);
    const labels = strings.preview;
    const geometry = templatePreviewGeometry(size, frameWidth);

    useEffect(() => {
        const frame = frameRef.current;
        if (frame === null) return undefined;
        setFrameWidth(frame.clientWidth);
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(() => setFrameWidth(frame.clientWidth));
        observer.observe(frame);
        return () => observer.disconnect();
    }, [size, element === undefined]);

    return (
        <section className='studio-template-preview' aria-label={formatTemplateBrowserMessage(labels.previewOf, { name: entry.displayName })} data-preview={entry.id}>
            <div className='studio-template-preview__controls'>
                <label>
                    <span>{labels.state}</span>
                    <select value={state} onChange={event => setState(event.target.value as TemplatePreviewState)}>
                        {Object.values(TemplatePreviewState).map(value => <option key={value} value={value}>{labels.states[value] ?? value}</option>)}
                    </select>
                </label>
                <label>
                    <span>{labels.size}</span>
                    <select value={size} onChange={event => setSize(event.target.value as TemplatePreviewSize)}>
                        {Object.values(TemplatePreviewSize).map(value => <option key={value} value={value}>{labels.sizes[value] ?? value}</option>)}
                    </select>
                </label>
            </div>
            {screens.length > 1 && (
                <ul className='studio-template-preview__screens' aria-label={labels.screens}>
                    {screens.map(candidate => (
                        <li key={candidate.name}>
                            <button type='button' aria-pressed={candidate === screen} onClick={() => setScreenName(candidate.name)}>{candidate.name}</button>
                        </li>
                    ))}
                </ul>
            )}
            <div className='studio-template-preview__frame' ref={frameRef} data-size={size} data-state={state}>
                {element
                    ? (
                        <div className='studio-template-preview__window' style={{ width: geometry.width }}>
                            <div className='studio-template-preview__title-bar' aria-hidden='true'>
                                {trafficLights.map(color => <span key={color} className='studio-template-preview__light' style={{ borderColor: color }} />)}
                                <span className='studio-template-preview__title'>{entry.displayName}</span>
                            </div>
                            <div className='studio-template-preview__body' style={{ height: geometry.height }}>
                                <div
                                    className='studio-template-preview__stage'
                                    style={{
                                        width: geometry.designWidth,
                                        height: geometry.designHeight,
                                        transform: `scale(${geometry.scale})`,
                                        ['--studio-surface-viewport-height' as string]: `${geometry.designHeight}px`,
                                    }}>
                                    <ErrorBoundary fallback={<p role='alert'>{labels.failed}</p>}>
                                        <SceneThemeProvider theme={theme} className={`studio-profile-theme ${profileColorSchemeClasses(theme)}`}>
                                            <IconAdapterProvider registry={runtime.iconAdapters}>
                                                <LayoutConfigProvider storage={null}>
                                                    <SceneElementView element={element} registry={runtime.registry} resolveBinding={() => undefined} />
                                                </LayoutConfigProvider>
                                            </IconAdapterProvider>
                                        </SceneThemeProvider>
                                    </ErrorBoundary>
                                </div>
                            </div>
                        </div>
                    )
                    : <p className='studio-template-preview__none'>{labels.none}</p>}
            </div>
        </section>
    );
}
