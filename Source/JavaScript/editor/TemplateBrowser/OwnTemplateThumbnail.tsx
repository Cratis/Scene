// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useRef, useState } from 'react';
import { TemplatePreviewState, LayoutConfigProvider } from '@cratis/scene.blueprint.default';
import { IconAdapterProvider, SceneElementView, SceneThemeProvider } from '@cratis/scene.react';
import { ErrorBoundary } from '@cratis/components/Common';
import { profileColorSchemeClasses } from '../ScreenEditor/Runtime/profileColorScheme';
import { profileTheme } from '../ScreenEditor/Runtime/profileTheme';
import { previewOfOwnTemplate } from './previewScreens';
import type { TemplateBrowserEntry } from './TemplateBrowserEntry';
import type { TemplateBrowserRuntime } from './TemplateBrowserPreview';
import './OwnTemplateThumbnail.css';

// The size the template is laid out at before it is shrunk into the card: a desktop window, in the card's 16:9.
const designWidth = 1280;
const designHeight = 720;

export interface OwnTemplateThumbnailProps {
    entry: TemplateBrowserEntry;

    runtime: TemplateBrowserRuntime;

    /** What is said when the template puts nothing anywhere, or has not arrived. */
    fallback: React.ReactNode;
}

/**
 * An application's own template drawn small, as the template it is - its slots in its arrangement with what it puts in them - in the card of the
 * template gallery. It takes no part in interaction.
 */
export function OwnTemplateThumbnail({ entry, runtime, fallback }: OwnTemplateThumbnailProps) {
    const frame = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const element = useMemo(
        () => previewOfOwnTemplate(entry, runtime.ownDocuments, TemplatePreviewState.Populated, runtime.bundles, runtime.profile),
        [entry, runtime.ownDocuments, runtime.bundles, runtime.profile]);
    const theme = useMemo(() => profileTheme(runtime), [runtime]);

    useEffect(() => {
        const host = frame.current;
        if (host === null || typeof ResizeObserver === 'undefined') return undefined;
        setWidth(host.clientWidth);
        const observer = new ResizeObserver(() => setWidth(host.clientWidth));
        observer.observe(host);
        return () => observer.disconnect();
    }, [element === undefined]);

    if (element === undefined) return <>{fallback}</>;

    const scale = width > 0 ? width / designWidth : 0.2;
    return (
        <div ref={frame} className='studio-own-template-thumbnail' aria-hidden='true' data-testid='studio-own-template-thumbnail'>
            <div className='studio-own-template-thumbnail__stage' style={{ width: designWidth, height: designHeight, transform: `scale(${scale})` }}>
                <ErrorBoundary fallback={<>{fallback}</>}>
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
    );
}
