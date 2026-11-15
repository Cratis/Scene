// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { IconAdapterProvider, SceneElementView, SceneOutletsProvider, SceneThemeProvider, type ComponentRegistry } from '@cratis/scene.react';
import '@cratis/scene.primereact/primeReactTheme.css';
import '../Runtime/ProfileThemeRoot.css';
import '../Runtime/PortableComponents.css';
import type { BindingResolver } from '@cratis/scene.engine';
import { LayoutConfigProvider, resolveElementComponentNames } from '@cratis/scene.blueprint.default';
import type { SceneDocument } from '@cratis/scene.model';
import { profileColorSchemeClasses } from '../Runtime/profileColorScheme';
import { profileTheme } from '../Runtime/profileTheme';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import { dialogFrameAttributes } from '../Surface/dialogFrameAttributes';
import '../Surface/DialogFrame.css';
import type { DialogFrameDescription } from '../Templates/dialogPresentation';
import { composePlayScreen } from './composePlayScreen';
import { blueprintDialogTemplatesOf, pageTemplateNamesOf } from '../Templates/displayedFits';

export interface PlayScreenViewProps {
    document: SceneDocument;
    runtime: ScreenEditorRuntime;
    resolveBinding: BindingResolver;

    // The components to draw with, when not the runtime's own: a miniature draws with sample content where a screen sets none, as the surface does.
    // Play never passes one.
    registry?: ComponentRegistry;

    // Whether the screen's slice is opened over a page (a State Change slice's), which is what makes a screen that states no fit a dialog. Not knowing, it is a page.
    opensOverPage?: boolean;
}

// The attributes that make the wrapper the backdrop of the popup the screen opens as.
const popup = (dialog: DialogFrameDescription) => {
    const { style, ...attributes } = dialogFrameAttributes(dialog);
    return { ...attributes, style: { ...style, minHeight: '100%' } };
};

// A screen as played. It renders the same composition the editor draws, through the same renderer and the same name
// resolution, with the configuration the templates were given - and with none of the editor's chrome: no selection, no
// drop targets, no fading of inherited content. Icons are drawn by the adapters of the profile's icon libraries, the same ones
// the editor draws them with. Interactions run when an interaction scope is provided around it.
export const PlayScreenView = ({ document, runtime, resolveBinding, registry = runtime.registry, opensOverPage = false }: PlayScreenViewProps) => {
    const knownDialogTemplates = useMemo(() => blueprintDialogTemplatesOf(runtime.bundles), [runtime.bundles]);
    const pageTemplateNames = useMemo(() => pageTemplateNamesOf(undefined, runtime.bundles), [runtime.bundles]);
    const screenTemplates = useMemo(() => runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? []), [runtime.bundles]);
    const layouts = useMemo(() => runtime.bundles.flatMap(bundle => bundle.layouts ?? []), [runtime.bundles]);
    const { element, configuration, dialog, outlets } = useMemo(
        () => composePlayScreen(document, runtime.catalog, knownDialogTemplates, pageTemplateNames, opensOverPage, screenTemplates, layouts),
        [document, runtime.catalog, knownDialogTemplates, pageTemplateNames, opensOverPage, screenTemplates, layouts]);
    const resolved = useMemo(() => resolveElementComponentNames(element, runtime.compositionProfile, runtime.packages), [element, runtime.compositionProfile, runtime.packages]);
    const theme = useMemo(() => profileTheme(runtime), [runtime]);
    const view = <SceneElementView element={resolved} registry={registry} resolveBinding={resolveBinding} configuration={configuration} />;
    const drawn = dialog ? <div className='studio-play-dialog' {...popup(dialog)}>{view}</div> : view;
    return (
        <SceneThemeProvider theme={theme} className={`studio-profile-theme ${profileColorSchemeClasses(theme)}`}>
            <IconAdapterProvider registry={runtime.iconAdapters}>
                {/* A shell part on its own - a topbar, a sidebar, a mask - reads the shell's configuration, which the application shell would provide. A
                    screen is drawn without one around it, and nothing is saved from it. */}
                <LayoutConfigProvider storage={null}>
                    {outlets ? <SceneOutletsProvider value={outlets}>{drawn}</SceneOutletsProvider> : drawn}
                </LayoutConfigProvider>
            </IconAdapterProvider>
        </SceneThemeProvider>
    );
};
