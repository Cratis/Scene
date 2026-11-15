// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { resolveElementComponentNames } from '@cratis/scene.blueprint.default';
import { resolveEffectiveConfiguration, resolveTemplateChain } from '@cratis/scene.engine';
import type { EffectiveConfiguration } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import type { ShellState } from '../ShellFrame/useShellFrame';
import { shellContentId } from '../ShellFrame/frameInShell';
import { peekElement } from '../ShellFrame/peekOfDestination';
import { spliceContent } from '../ShellFrame/spliceContent';
import { ownContentOnly } from '../Templates/ownContentOnly';

// What a screen adds to a template that lets it - a navigation item, say - is drawn where Play draws it, so a thing added is seen as it will be.
// Resolved the way Play resolves it (`composePlayScreen`); a host that already has the configuration passes it.
export const useEffectiveConfiguration = (given: EffectiveConfiguration | undefined, controller: ScreenEditorController) => {
    const { document, context } = controller;
    return useMemo(
        () => given ?? (document.instanceContributions.length > 0 ? resolveEffectiveConfiguration(resolveTemplateChain(document, context.scope), document.instanceContributions, context.catalog) : undefined),
        [given, document, context]);
};

// The composed screen with its component names resolved is set in the shell's primary slot when the shell is on.
export const useDrawnScreen = (controller: ScreenEditorController, environment: ScreenEditorEnvironment, shell: ShellState | undefined, editorStrings: ScreenEditorStrings | undefined) => {
    const { composition } = controller;

    // Documents keep bare component names so the UI profile decides which package implements them; the names are
    // resolved here, for drawing only, exactly as Play resolves them.
    // A slice's prototype is the slice's own content: what the screen's template puts around it is drawn only when the author asks for it.
    const templateHidden = shell !== undefined && shell.template.available && !shell.template.shown;
    const displayed = useMemo(() => templateHidden ? ownContentOnly(composition) : composition.element, [templateHidden, composition]);
    const resolved = useMemo(
        () => resolveElementComponentNames(displayed, environment.runtime.compositionProfile, environment.runtime.packages),
        [displayed, environment.runtime.compositionProfile, environment.runtime.packages]);

    // With the shell on, the screen goes in the shell's primary slot; while a destination is peeked at from the shell's navigation, the slot says
    // whose it is instead, and the screen is not editable until Back (or Escape).
    const peeking = shell?.peeking;
    const peekText = editorStrings?.shellPeeking(shell?.peekingName ?? '') ?? '';
    return useMemo(() => {
        const frame = shell?.frame;
        if (!frame) return resolved;
        return spliceContent(frame.element, shellContentId, peeking ? peekElement(peeking, peekText) : resolved);
    }, [shell?.frame, resolved, peeking, peekText]);
};
