// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { DialogTemplate, SampleDataPack, Theme } from '@cratis/scene.model';
import { ComponentRegistry, SceneElementView } from '@cratis/scene.react';
import { LayoutConfigProvider, LayoutConfigState } from '../configuration';
import { previewComponents, previewTemplateComponent } from '../preview-host/PreviewTemplate';
import { LayoutThemeProvider, defaultBlueprintThemes } from '../themes';
import { externalComponent } from './elements';
import { ForcedComponentState, forceComponentState, galleryPreviewRegistry, queryResultsOf } from './GalleryScreenPreview';
import { galleryDialogTemplates } from './dialogTemplates';
import { galleryComponentCatalog, previewProfileFor } from './previewProfile';
import { resolveElementComponentNames } from './resolveElementNames';
import { TemplatePreviewState } from './TemplatePreviewState';

/** One gallery dialog template by name, for a story or a host that opens a specific one. */
export const galleryDialogTemplate = (name: string): DialogTemplate | undefined => galleryDialogTemplates.find(template => template.name === name);

export interface GalleryDialogPreviewProps {
    /** The name of the gallery dialog template to open. */
    dialogName: string;

    /** Configuration to start from. */
    initialConfig?: Partial<LayoutConfigState>;

    /** The themes the preview may switch between. Defaults to the two this blueprint ships. */
    themes?: Theme[];

    /** The component registry to render against. Defaults to `core` plus this blueprint's own components. */
    registry?: ComponentRegistry;

    /** The data state to show. Defaults to the seeded, populated records. */
    state?: TemplatePreviewState;

    /** The sample-data pack that stands in for the queries the template binds to. */
    pack?: SampleDataPack;

    /** A standard state (spec Part B 1.4) to force on every foundation component of the dialog that owns the five states. */
    forceState?: ForcedComponentState;
}

/**
 * Opens one gallery dialog template the way a host does: inside a `role="dialog" aria-modal="true"` element, with the template's content in the wrapper
 * a screen's template gets. Nothing here is a preview-only path - the dialog is a real {@link DialogTemplate} rendered by the real `SceneElementView`,
 * and the dialog's own frame gives the host element its focus handling, placement and labelling exactly as it does in an application.
 */
export function GalleryDialogPreview({ dialogName, initialConfig, themes = defaultBlueprintThemes, registry = galleryPreviewRegistry, state = TemplatePreviewState.Populated, pack, forceState }: GalleryDialogPreviewProps) {
    const template = galleryDialogTemplate(dialogName);
    if (!template) throw new Error(`The gallery has no dialog template named '${dialogName}'.`);

    const element = useMemo(() => {
        const composed = externalComponent(`dialog-${template.name}`, previewTemplateComponent, {}, template.content ?? {});
        const resolved = resolveElementComponentNames(composed, previewProfileFor(registry), galleryComponentCatalog);
        return forceState ? forceComponentState(resolved, forceState) : resolved;
    }, [template, forceState, registry]);
    const full = useMemo(() => ({ ...registry, ...previewComponents }), [registry]);

    return (
        <LayoutConfigProvider initialConfig={initialConfig} storage={null}>
            <LayoutThemeProvider themes={themes}>
                <div role='dialog' aria-modal='true' aria-label={template.displayName ?? template.name} data-scene-dialog={template.name}>
                    <SceneElementView element={element} registry={full} resolveBinding={() => undefined} queryResults={queryResultsOf(pack, state)} />
                </div>
            </LayoutThemeProvider>
        </LayoutConfigProvider>
    );
}
