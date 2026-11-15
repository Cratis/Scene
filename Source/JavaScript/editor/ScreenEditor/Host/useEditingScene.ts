// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import type { SceneElement } from '@cratis/scene.model';
import type { EditingContext } from '@cratis/scene.engine';
import { authoredRoot, editingScope } from '../Document/studioScreen';
import { computeDropRegions } from '../DropRegions/computeDropRegions';
import { createSceneStructureAdapter } from '../Selection/sceneStructureAdapter';
import { surfaceArrangementOfRoot } from '../Selection/surfaceArrangementOfRoot';
import { composeEditorScreen } from '../Templates/composeEditorScreen';
import { showsDialogActions } from '../Templates/dialogActionsChrome';
import { blueprintDialogTemplatesOf } from '../Templates/displayedFits';
import { resolveOwnership } from '../Templates/templateProvenance';
import type { ScreenEditSession } from '../Session/EditSession';
import { useLoadedIconCatalog } from '../Runtime/useLoadedIconCatalog';
import { useDesignTimeCommands } from '../Forms/useDesignTimeCommands';
import type { ScreenEditorEnvironment } from './ScreenEditorHost';

export const useEditingScene = (document: ScreenEditSession['document'], authoringTemplate: string | undefined, environment: ScreenEditorEnvironment, opensOverPage = false) => {
    const iconsLoaded = useLoadedIconCatalog(environment.runtime.icons);

    // A command form draws the command it names, by the slice id the editor stores, so the slices stand in as commands while the editor is open.
    useDesignTimeCommands(environment.stateChangeSlices, environment.registerDesignTimeCommands);

    const context = useMemo<EditingContext>(() => ({
        catalog: environment.runtime.catalog,
        scope: editingScope(authoringTemplate, authoringTemplate !== undefined),
        queryCandidates: [...environment.queryCandidates],
        // The catalogs are read after the first render; `iconsLoaded` rebuilds the context once they are in.
        iconCatalog: environment.runtime.icons,
    }), [environment, authoringTemplate, iconsLoaded]);

    const knownTemplates = useMemo(() => [...(environment.ownTemplates ?? []), ...environment.runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? [])], [environment.ownTemplates, environment.runtime.bundles]);
    const knownLayouts = useMemo(() => environment.runtime.bundles.flatMap(bundle => bundle.layouts ?? []), [environment.runtime.bundles]);
    const dialogActions = authoringTemplate === undefined && showsDialogActions(document, knownTemplates, knownLayouts, opensOverPage, blueprintDialogTemplatesOf(environment.runtime.bundles));
    const composition = useMemo(() => composeEditorScreen(document, authoringTemplate, { dialogActions }), [document, authoringTemplate, dialogActions]);
    const ownershipOf = useMemo(() => resolveOwnership(document, composition.roots, context), [document, composition, context]);
    const adapter = useMemo(() => createSceneStructureAdapter(ownershipOf), [ownershipOf]);
    const authored = authoredRoot(document, authoringTemplate);

    // The composition is a neutral wrapper around the template content and the authored root, so nothing can be dropped
    // beside the root itself - only inside the containers beneath it.
    const dropRegions = useMemo(
        () => computeDropRegions<SceneElement>(composition.roots, surfaceArrangementOfRoot(authored), adapter).filter(region => region.containerId !== null),
        [composition, authored, adapter]);

    return { context, composition, ownershipOf, adapter, authored, dropRegions };
};
