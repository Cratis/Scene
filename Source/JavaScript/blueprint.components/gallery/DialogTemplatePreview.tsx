// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { SceneElement } from '@cratis/scene.model';
import { ComponentRegistry, SceneElementView } from '@cratis/scene.react';
import { resolveElementComponentNames } from '@cratis/scene.blueprint.default';
import { componentsDialogTemplates } from '../templates';
import { componentsBlueprintCatalog, componentsBlueprintProfile } from './previewProfile';
import { componentsPreviewRegistry } from './GalleryScreenPreview';

export interface DialogTemplatePreviewProps {
    /** The name of the dialog template to boot. */
    templateName: string;

    /** The component registry to render against. Defaults to {@link componentsPreviewRegistry}. */
    registry?: ComponentRegistry;
}

/**
 * Boots one dialog template through the real engine.
 *
 * A dialog has no layout and no shell, because it occupies no slot - it opens *over* whatever is already
 * on screen. So there is nothing to compose it into: the template's own content is the whole tree, and it
 * goes straight through `resolveComponentName` and `SceneElementView` exactly as a screen's does.
 *
 * Each of these templates declares one slot, so flattening the content is the whole of "assembling" it.
 * That is a consequence of the composites owning their own frames rather than a simplification here.
 */
export function DialogTemplatePreview({ templateName, registry = componentsPreviewRegistry }: DialogTemplatePreviewProps) {
    const elements = useMemo(() => {
        const template = componentsDialogTemplates.find(candidate => candidate.name === templateName);
        if (!template) {
            throw new Error(`This blueprint has no dialog template named '${templateName}'.`);
        }

        return Object.values(template.content ?? {})
            .flat()
            .map((element: SceneElement) => resolveElementComponentNames(element, componentsBlueprintProfile, componentsBlueprintCatalog));
    }, [templateName]);

    return (
        <>
            {elements.map(element => (
                <SceneElementView key={element.id} element={element} registry={registry} resolveBinding={() => undefined} />
            ))}
        </>
    );
}
